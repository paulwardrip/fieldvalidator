String.prototype.toTitleCase = function () {
    return this.replace(/\b\w+/g, function(txt){
        if ($.inArray(txt.toLowerCase(), ["of", "and", "for"]) > -1) { return txt.toLowerCase();
        } else { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }});
};
