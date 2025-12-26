use wasm_bindgen::prelude::*;
use naga::{front, back, valid};

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct ConversionOutput {
    success: bool,
    output: String,
    error: String,
}

#[wasm_bindgen]
impl ConversionOutput {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool { self.success }
    
    #[wasm_bindgen(getter)]
    pub fn output(&self) -> String { self.output.clone() }
    
    #[wasm_bindgen(getter)]
    pub fn error(&self) -> String { self.error.clone() }
}

/// Main conversion function supporting multiple source and target languages
/// source_lang: "glsl" | "wgsl"
/// target_lang: "glsl" | "hlsl" | "wgsl" | "msl"
/// stage_str: "vertex" | "fragment" | "compute"
#[wasm_bindgen]
pub fn convert_shader(code: &str, source_lang: &str, target_lang: &str, stage_str: &str) -> ConversionOutput {
    let stage = match stage_str {
        "vertex" => naga::ShaderStage::Vertex,
        "compute" => naga::ShaderStage::Compute,
        _ => naga::ShaderStage::Fragment,
    };

    // Parse source code into Naga IR Module
    let module = match source_lang {
        "wgsl" => parse_wgsl(code),
        "glsl" | _ => parse_glsl(code, stage),
    };

    let module = match module {
        Ok(m) => m,
        Err(e) => return error_output(&e),
    };

    // Validate module
    let mut validator = valid::Validator::new(valid::ValidationFlags::all(), valid::Capabilities::all());
    let info = match validator.validate(&module) {
        Ok(i) => i,
        Err(e) => return error_output(&format!("Validation Error: {:?}", e)),
    };

    // Write to target format
    let result_code = match target_lang {
        "hlsl" => write_hlsl(&module, &info),
        "wgsl" => write_wgsl(&module, &info),
        "msl" => write_msl(&module, &info),
        "glsl" => write_glsl(&module, &info, stage),
        _ => Err(format!("Unknown target format: {}", target_lang)),
    };

    match result_code {
        Ok(output) => ConversionOutput {
            success: true,
            output,
            error: String::new(),
        },
        Err(e) => error_output(&e),
    }
}

/// Legacy function for backwards compatibility
#[wasm_bindgen]
pub fn convert_glsl(code: &str, format: &str, stage_str: &str) -> ConversionOutput {
    convert_shader(code, "glsl", format, stage_str)
}

fn parse_glsl(code: &str, stage: naga::ShaderStage) -> Result<naga::Module, String> {
    // Preprocessing for Naga/Vulkan Compatibility
    let mut clean_code = code.lines()
        .filter(|l| !l.starts_with("#version"))
        .filter(|l| !l.starts_with("precision"))
        .collect::<Vec<&str>>()
        .join("\n");
        
    // Replace standard uniforms with commented versions
    clean_code = clean_code.replace("uniform float uTime;", "// uniform float uTime;");
    clean_code = clean_code.replace("uniform vec2 uResolution;", "// uniform vec2 uResolution;");

    // Inject layout locations for standard inputs
    clean_code = clean_code.replace("in vec2 vUv;", "layout(location=0) in vec2 vUv;");
    clean_code = clean_code.replace("in vec3 vNormal;", "layout(location=1) in vec3 vNormal;");
    clean_code = clean_code.replace("in vec3 vViewPosition;", "layout(location=2) in vec3 vViewPosition;");

    // Construct Vulkan-compatible header
    let refined_code = format!(r#"#version 450
layout(std140, set=0, binding=0) uniform Globals {{
    float uTime;
    vec2 uResolution;
}};
{}"#, clean_code);

    let mut parser = front::glsl::Frontend::default();
    let options = front::glsl::Options {
        stage,
        defines: Default::default(),
    };
    
    parser.parse(&options, &refined_code)
        .map_err(|e| format!("GLSL Parse Error: {:?}\n\nPreprocessed Code:\n{}", e, refined_code))
}

fn parse_wgsl(code: &str) -> Result<naga::Module, String> {
    front::wgsl::parse_str(code)
        .map_err(|e| format!("WGSL Parse Error: {:?}", e))
}

fn error_output(msg: &str) -> ConversionOutput {
    ConversionOutput {
        success: false,
        output: String::new(),
        error: msg.to_string(),
    }
}

fn write_hlsl(module: &naga::Module, info: &valid::ModuleInfo) -> Result<String, String> {
    let mut string = String::new();
    let options = back::hlsl::Options::default();
    let mut writer = back::hlsl::Writer::new(&mut string, &options);
    writer.write(module, info).map_err(|e| format!("{:?}", e))?;
    Ok(string)
}

fn write_wgsl(module: &naga::Module, info: &valid::ModuleInfo) -> Result<String, String> {
    let options = back::wgsl::WriterFlags::empty();
    back::wgsl::write_string(module, info, options).map_err(|e| format!("{:?}", e))
}

fn write_msl(module: &naga::Module, info: &valid::ModuleInfo) -> Result<String, String> {
    let mut string = String::new();
    let options = back::msl::Options::default();
    let binding_map = back::msl::PipelineOptions::default();
    let mut writer = back::msl::Writer::new(&mut string);
    writer.write(module, info, &options, &binding_map).map_err(|e| format!("{:?}", e))?;
    Ok(string)
}

fn write_glsl(module: &naga::Module, info: &valid::ModuleInfo, stage: naga::ShaderStage) -> Result<String, String> {
    let mut string = String::new();
    let options = back::glsl::Options {
        version: back::glsl::Version::Desktop(450),
        writer_flags: back::glsl::WriterFlags::empty(),
        binding_map: Default::default(),
        zero_initialize_workgroup_memory: true,
    };
    let pipeline_options = back::glsl::PipelineOptions {
        shader_stage: stage,
        entry_point: "main".to_string(),
        multiview: None,
    };
    let mut writer = back::glsl::Writer::new(&mut string, module, info, &options, &pipeline_options, Default::default())
        .map_err(|e| format!("{:?}", e))?;
    writer.write().map_err(|e| format!("{:?}", e))?;
    Ok(string)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_glsl_to_wgsl() {
        let glsl = "void main() { gl_FragColor = vec4(1.0); }";
        let result = convert_shader(glsl, "glsl", "wgsl", "fragment");
        assert!(result.success);
    }

    #[test]
    fn test_wgsl_to_hlsl() {
        let wgsl = "@fragment fn main() -> @location(0) vec4<f32> { return vec4<f32>(1.0); }";
        let result = convert_shader(wgsl, "wgsl", "hlsl", "fragment");
        assert!(result.success);
    }
}
