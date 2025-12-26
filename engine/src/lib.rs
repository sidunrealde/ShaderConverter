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

#[wasm_bindgen]
pub fn convert_glsl(code: &str, format: &str, stage_str: &str) -> ConversionOutput {
    let stage = match stage_str {
        "vertex" => naga::ShaderStage::Vertex,
        "compute" => naga::ShaderStage::Compute,
        _ => naga::ShaderStage::Fragment,
    };

    // 1. Parse GLSL
    let mut parser = front::glsl::Parser::default();
    let options = front::glsl::Options {
        stage,
        defines: Default::default(),
    };
    
    let module = match parser.parse(&options, code) {
        Ok(m) => m,
        Err(e) => return error_output(&format!("GLSL Parse Error: {:?}", e)),
    };

    // 2. Validate
    let mut validator = valid::Validator::new(valid::ValidationFlags::all(), valid::Capabilities::all());
    let info = match validator.validate(&module) {
        Ok(i) => i,
        Err(e) => return error_output(&format!("Validation Error: {:?}", e)),
    };

    // 3. Write Target
    let result_code = match format {
        "hlsl" => write_hlsl(&module, &info),
        "wgsl" => write_wgsl(&module, &info),
        "msl" => write_msl(&module, &info),
        _ => Err(format!("Unknown format: {}", format)),
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_conversion() {
        let glsl = "void main() { gl_FragColor = vec4(1.0); }";
        let result = convert_glsl(glsl, "wgsl", "fragment");
        assert!(result.success);
        assert!(result.output.contains("@fragment"));
    }
}
