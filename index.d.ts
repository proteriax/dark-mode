declare const config: {
    attribute: string;
    textColor: string;
    hooks: {
        /** Returns false to stop processing this rule */
        onCSSStyleRule(style: CSSStyleRule): void | false;
    };
    replaceMap: {
        ffffff: string;
    };
};
type Config = typeof config;
declare function start(configs: Partial<Config>): Promise<void>;
export { config, Config, start };
