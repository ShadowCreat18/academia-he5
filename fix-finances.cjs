const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources', 'js', 'Pages', 'Parent', 'Finances.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace fetch with axios
content = content.replace(
    "const response = await fetch(route('parent.stripe.checkout'), {",
    "const response = await axios.post(route('parent.stripe.checkout'), payload);"
);

content = content.replace(
    "method: 'POST',",
    ""
);

content = content.replace(
    "headers: {",
    ""
);

content = content.replace(
    "'Content-Type': 'application/json',",
    ""
);

content = content.replace(
    "'X-CSRF-TOKEN': csrfToken,",
    ""
);

content = content.replace(
    "'Accept': 'application/json',",
    ""
);

content = content.replace(
    "},",
    ""
);

content = content.replace(
    "body: JSON.stringify(payload),",
    ""
);

content = content.replace(
    "});",
    ""
);

content = content.replace(
    "const data = await response.json();",
    "const data = response.data;"
);

content = content.replace(
    "const csrfToken = document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content') || '';",
    ""
);

if (!content.includes("import axios")) {
    content = content.replace(
        "import { Head, router } from '@inertiajs/react';",
        "import { Head, router } from '@inertiajs/react';\nimport axios from 'axios';"
    );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Finances.jsx');
