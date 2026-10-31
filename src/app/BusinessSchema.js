import { SITE_URL, jsonLd } from "@/lib/site-seo.mjs";
export default function BusinessSchema({ branch }) {
 const url = branch ? new URL(branch.path,SITE_URL).href : SITE_URL;
 const data = branch ? {"@context":"https://schema.org","@type":"LocalBusiness","@id":url+"#branch",name:branch.name,url,parentOrganization:{"@id":SITE_URL+"#organization"},address:{"@type":"PostalAddress",streetAddress:branch.address,addressLocality:branch.city,addressRegion:branch.state,postalCode:branch.pincode,addressCountry:"IN"},...(branch.phone ? {telephone:branch.phone}:{}),} : {"@context":"https://schema.org","@type":"Organization","@id":SITE_URL+"#organization",name:"Aryan Gold Buyers",url:SITE_URL,telephone:"+919117125555"};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(data)}} />;
}
