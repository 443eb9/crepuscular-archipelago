function getFile(url: string) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url, false);
    httpRequest.send();
    if (httpRequest.status == 200)
        return httpRequest.responseText;
    else
        return "";
}

function resolveLygia(lines: string | string[]) {
    if (!Array.isArray(lines)) {
        lines = lines.split(/\r?\n/);
    }

    let src = "";
    lines.forEach((line, i) => {
        const line_trim = line.trim();
        if (line_trim.startsWith('#include \"lygia')) {
            let include_url = line_trim.substring(15);
            include_url = "https://lygia.xyz" + include_url.replace(/\"|\;|\s/g, '');
            src += getFile(include_url) + '\n';
        }
        else {
            src += line + '\n';
        }
    });

    return src;
}

async function resolveLygiaAsync(lines: string | string[]) {
    if (!Array.isArray(lines))
        lines = lines.split(/\r?\n/);

    let src = "";
    const response = await Promise.all(
        lines.map(async (line, i) => {
            const line_trim = line.trim();
            if (line_trim.startsWith('#include "lygia')) {
                let include_url = line_trim.substring(15);
                include_url = "https://lygia.xyz" + include_url.replace(/\"|\;|\s/g, "");
                return fetch(include_url).then((res) => res.text());
            }
            else
                return line;
        })
    );

    return response.join("\n");
}
export { resolveLygia as default };
