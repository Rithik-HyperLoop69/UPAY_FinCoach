declare module '*.html?raw' {
  const content: string;
  export default content;
}

declare module '@designcodeio/threeui' {
  export * from 'src/shaders/shader-buttons/ShaderButtons';
}
