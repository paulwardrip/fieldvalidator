function toXML(json, depth) {
    var xml = "";
    if (!depth) depth = 0;
    for (var node in json) {
        if (typeof json[node] === "object") {
            if (json[node] instanceof Array) {
                for (var idx in json[node]) {
                    for (var i = 0; i < depth; i++) {
                        xml += "\t";
                    }
                    xml += "<" + node + ">";

                    if (typeof json[node][idx] === "object") {
                        xml += "\n";
                        xml += toXML(json[node][idx], depth + 1);
                        for (var i = 0; i < depth; i++) {
                            xml += "\t";
                        }
                    } else {
                        xml += json[node][idx];
                    }
                    xml += "</" + node + ">\n";
                }
            } else if (node !== "attributes") {
                for (var i = 0; i < depth; i++) {
                    xml += "\t";
                }

                xml += "<" + node;
                for (var a in json[node].attributes) {
                    xml += " " + a + "=\"" + json[node].attributes[a] + "\"";
                }
                xml += ">\n";

                xml += toXML(json[node], depth + 1);
                for (var i = 0; i < depth; i++) {
                    xml += "\t";
                }
                xml += "</" + node + ">\n";
            }
        } else {
            for (var i = 0; i < depth; i++) {
                xml += "\t";
            }
            xml += "<" + node + ">" + json[node] + "</" + node + ">\n";
        }
    }
    return xml;
}
