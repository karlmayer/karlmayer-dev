// Starlight's Page.astro imports Vite virtual modules that ship no type declarations.
// `astro check` stubbed these; plain `tsc` + @astrojs/ts-content-mapper needs them declared.
declare module "virtual:starlight/components/*" {
    const Component: (props: Record<string, unknown>) => unknown;
    export default Component;
}
declare module "virtual:starlight/user-css";
declare module "virtual:starlight/optional-css";
