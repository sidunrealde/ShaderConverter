echo "Building WASM..."
cd engine
wasm-pack build --target web
echo "Copying to src..."
cd ..
mkdir -p src/engine-pkg
cp -r engine/pkg/* src/engine-pkg/
echo "Done!"
