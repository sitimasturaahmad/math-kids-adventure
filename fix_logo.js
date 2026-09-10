const fs = require('fs');

const bakCode = fs.readFileSync('src/app/page.js.bak', 'utf-8');
// Extract MATH_VERSA_LOGO block
const match = bakCode.match(/(const MATH_VERSA_LOGO =[\s\S]*?");/);

if (match) {
    const logoBlock = match[1] + ';\n\n';
    
    let sharedUI = fs.readFileSync('src/components/ui/SharedUI.js', 'utf-8');
    
    // Inject before export function BrandLogo
    sharedUI = sharedUI.replace('export function BrandLogo', logoBlock + 'export function BrandLogo');
    
    fs.writeFileSync('src/components/ui/SharedUI.js', sharedUI);
    console.log("Injected MATH_VERSA_LOGO into SharedUI.js");
} else {
    console.log("Could not find MATH_VERSA_LOGO in page.js.bak");
}
