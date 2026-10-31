export const SITE_URL = "https://aryangoldbuyers.com";
export const PAGE_DEFAULTS = {
"/": {title:"Gold Buyers in Bangalore & Chennai | Aryan Gold Buyers",description:"Explore gold selling, pledged gold assistance and valuation services. Find a branch and understand your offer before selling."},
"/about-us": {title:"About Aryan Gold Buyers | Gold Valuation",description:"Learn about Aryan Gold Buyers and our approach to gold valuation. Understand weight, purity and the offer before deciding to sell."},
"/branches": {title:"Gold Buying Branches | Aryan Gold Buyers",description:"Find active branches, street addresses, opening hours and directions for a personal gold valuation with Aryan Gold Buyers."},
"/documents": {title:"Documents Required to Sell Gold | Aryan Gold Buyers",description:"Review the identity and ownership documents to prepare before selling gold or requesting pledged gold assistance."},
"/how-it-works": {title:"How Gold Testing & Valuation Works | Aryan Gold Buyers",description:"Understand gold evaluation, verification, reviewing your offer and payment formalities before you sell."},
"/gold-rate": {title:"Published Gold Rates | Aryan Gold Buyers",description:"Check indicative gold rates per gram and estimate metal value. Final purchase offers require physical evaluation and verification."},
"/services": {title:"Gold Selling & Valuation Services | Aryan Gold Buyers",description:"Explore selling gold, pledged gold assistance and doorstep valuation. Contact our team to confirm availability and requirements."}
};
export const PUBLIC_ROUTES = [...Object.keys(PAGE_DEFAULTS),"/contact-us","/gold-rate-calculation","/services/sell-gold","/services/release-pledged-gold","/services/doorstep-valuation"];
export function jsonLd(value) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
