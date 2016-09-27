var xsdoptions = {
    load: function (url) {
        var promise = $.get(url, {}, function (xml) {
            xsdoptions.xsd = $(xml);
            console.log (xsdoptions.xsd);
            xsdoptions.collection = {};
        }, "xml");

        xsdoptions.ready = promise.done;
        return promise;
    },

    data: function (typename) {
        if (xsdoptions.collection[typename]) {
            return xsdoptions.collection[typename];

        } else {
            var arr = [];
            if (xsdoptions.xsd) {
                xsdoptions.xsd.find("simpleType[name='" + typename + "']").find("enumeration").each(function () {
                    var label = null;
                    $(this).find("documentation").each(function() { label = $(this).text(); });
                    arr.push({ value: $(this).attr("value"), label: (label) ? label : $(this).attr("value") });
                })
            }

            xsdoptions.collection[typename] = arr;
            console.log ("Loaded " + arr.length + " enumerated options from simpleType: " + typename);

            return arr;
        }
    },

    link: function (selector, typename, formatter) {
        if (xsdoptions.ready) {
            xsdoptions.ready(function () {
                xsdoptions.data(typename);

                xsdoptions.domListener(selector, function () {
                    var $elem = $(this);
                    var values = xsdoptions.data(typename);
                    xsdoptions.populate($elem, values, formatter);
                });
            });
        }
    },

    domListener: function(selector, callback) {
        $(selector).each(callback);

        // Create a mutation observer to automatically hook up any dynamically added form fields.
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    $(node).find(selector).each(callback);
                });
            });
        });

        var toObserve = {
            attributes: false,
            characterData: false,
            childList: true,
            subtree: true
        };

        observer.observe(document, toObserve);
    },

    populate: function ($elem, values, formatter) {
        if ($elem.find("option").length <= 1) {
            if ($elem.find("option").length === 0) $elem.append("<option value=\"\"></option>");
            $(values).each(function () {
                if (!formatter) {
                    $elem.append("<option value=\"" + this.value + "\">" + this.label + "</option>");
                } else {
                    $elem.append(formatter(this));
                }
            });
        }
    }
};
