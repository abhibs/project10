const visual = (theme, asset, label) => ({ theme, asset, label });

export function selectBlogVisual(post) {
  const title = `${post.slug || ""} ${post.title || ""}`.toLowerCase().replaceAll("-", " ");
  if (/purity|hallmark|huid|karat|carat|xrf|acid test|fake|real gold|kdm|bis |916|750 gold|999 vs|identify/.test(title)) return visual("purity", "/gold-xrf-testing.webp", "PURITY & TESTING");
  if (/\b\d+(?:\.\d+)?\s*grams?\b/.test(title)) return visual("weight", "/valuation-weight.webp", "GOLD WEIGHT GUIDE");
  if (/how.*(?:weigh|grams|gram)|weight units|weight conversion|tola|tulam|pavan|savaran|sovereign|bhori|kasu|ounce|ana gold|weigh gold/.test(title)) return visual("weight", "/valuation-weight.webp", "GOLD WEIGHT GUIDE");
  if (/business|medical|emergency/.test(title)) return visual("cash", "/blog-scenes/cash.webp", "GOLD & YOUR MONEY");
  if (/tax|gst|tcs|aadhaar|pan card|kyc|document|legal|inherit|ownership|269st|itr|customs|airport|import gold|nri/.test(title)) return visual("documents", "/experience-documentation.webp", "DOCUMENTS & GUIDANCE");
  if (/sell gold in\b|gold buyers in\b|gold buyers near/.test(title)) return visual("people", "/blog-scenes/people.webp", "SELL WITH CONFIDENCE");
  if (/bangle|kada|chudi|chura/.test(title)) return visual("bangles", "/ornaments/services-bangles.webp", "GOLD JEWELLERY GUIDE");
  if (/earring|jhumka|jhumki|studs|ear stud|bali |sui dhaga|threader/.test(title)) return visual("earrings", "/ornaments/calculator-earrings.webp", "GOLD JEWELLERY GUIDE");
  if (/ring|band gold/.test(title)) return visual("rings", "/ornaments/contact-rings.webp", "GOLD JEWELLERY GUIDE");
  if (/bracelet|wrist/.test(title)) return visual("bracelets", "/ornaments/branches-bracelet.webp", "GOLD JEWELLERY GUIDE");
  if (/pendant|locket|tanmaniya/.test(title)) return visual("pendants", "/ornaments/pledge-pendant.webp", "GOLD JEWELLERY GUIDE");
  if (/chain|necklace|haar|haram|mangalsutra|thali|mala|choker/.test(title)) return visual("necklaces", "/ornaments/faq-necklace.webp", "GOLD JEWELLERY GUIDE");
  if (/coin|guinea/.test(title)) return visual("coins", "/buy-gold-coins.webp", "GOLD COINS & VALUE");
  if (/loan|pledge|pawn|nbfc|debt|cash|payment|medical|business|down payment|emergency|instant/.test(title)) return visual("cash", "/blog-scenes/cash.webp", "GOLD & YOUR MONEY");
  if (/bar|biscuit|bullion|invest|etf|mutual fund|fixed deposit|real estate|sgb|bond|forecast|price|rate/.test(title)) return visual("bullion", "/buy-gold-bars.webp", "GOLD VALUE & MARKETS");
  if (/buyer|sell|selling|branch|valuation|offer|compare|trusted|safe|scam|process|mistake/.test(title)) return visual("people", "/blog-scenes/people.webp", "SELL WITH CONFIDENCE");
  const description = `${post.description || ""} ${post.excerpt || ""}`.toLowerCase();
  if (/weighing|grams|weigh /.test(description)) return visual("weight", "/valuation-weight.webp", "GOLD WEIGHT GUIDE");
  if (/cash|payment|loan/.test(description)) return visual("cash", "/blog-scenes/cash.webp", "GOLD & YOUR MONEY");
  return visual("gold", "/blog-scenes/gold.webp", "THE GOLD JOURNAL");
}
