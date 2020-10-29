interface Config {
    /** Attribute name for targeting inline style attributes */
    attribute: string;
    /** Base text color. It can be a CSS variable. */
    textColor: string;
    hooks: {
        /** Returns false to stop processing this rule */
        onCSSStyleRule?(style: CSSStyleRule): void | false;
        /** Color filter. Return false to skip the node */
        shouldApplyTextColor?(node: HTMLElement): boolean;
        /** Background filter. Return false to skip the node */
        shouldApplyBackground?(node: HTMLElement): boolean;
    };
    /** Special cases for these colors. */
    replaceMap: Record<string, string>;
}
declare function start(configs: Partial<Config>): Promise<void>;
export { Config, start };
