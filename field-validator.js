
// The initial api for configuring the validator is available immediately.
var fieldValidator = function(){
    var handler;

    return {
        fieldSelector: ".form-control",
        errorSelector: ".form-error",

        inputDelay: 2000,
        animDelay: 500,

        colorValid: "blue",
        colorInvalid: "red",

        borderValid: undefined,
        borderInvalid: "red",

        backgroundValid: undefined,
        backgroundInvalid: undefined,

        describe: function (element, value) {
            function ident() {
                if ($(element).attr("id")) {
                    return "#" + $(element).attr("id");
                } else if ($(element).attr("name")) {
                    return "[name=" + $(element).attr("name") + "]";
                } else {
                    return "." + $(element).attr("class").replace(/ /g, '.');
                }
            }
            return "<" + $(element)[0].tagName + "/> " + ident() + (!value ? "" : ": " + $(element).val());
        },

        onvalid: function (callback) {
            if (callback) {
                handler = callback;
            } else {
                return handler;
            }
        }
    }
}();

// String prototypes for the library.
String.prototype.pad = function (max, chr) {
    var padw = chr || "0";
    return this.length < max ? (padw + this).pad(max, padw) : this;
};

String.prototype.toTitleCase = function () {
    return this.replace(/\b(\w|')+/g, function(txt){
        if ($.inArray(txt.toLowerCase(), ["of", "and", "for"]) > -1) { return txt.toLowerCase();
        } else { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }});
};

// We initialize all the validator core functionality after the document loads.
$(document).ready (function(){
    var PATTERNS = {
        email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        money: /^[0-9 ',]*(|[.,][0-9]{2})?$/
    };

    var IMG = {
        amex: "data:image/png;base64,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",
        visa: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE6klEQVRYR+2We0zTVxTHv78+qK0FHIIGgel0wnSEjE6XsE3GQEQDyBzqMl02tLA5mMrYCLLBSBmBgQjCyqO8mYlx6BJFsYoMHyTzwbBAkGcGgapsK1hwUqRAf8vvVhuaNluiSP/xJs3v3HPPuedz7zm991KwcKMsHB/PAaisrCy+QCA4TNP0VgB2c5SSUYqiftZoNNFUQUFBubu7e5hIJAKPx5uT+FqtFk1NTWhra6ugpFKpZvfu3fyDVc0okndjmmKDxeECLKY8ZqtEaEBHQzc9Bd2kFoFrnJC3bx3KysrGKZlMRoeFhcE3thq9Ki1YPB7YXA7AYoOingyg/NNV2FXUAebLNCJHMDKNnZnX4SCk0CgNRUVFBaj8/HwC4B9Xg96h2QXQjigJgNUCF0wM9+PogQACYC8Eruds0QNIpVICsCO1Dte67oHF5T51Cqbu3wHHxmlGPelToFUPgMW3h6vjfJxLC9QD5ObmEgBLNAKQnZ1tApB6XIHimg60F30AvhWbsHlEnYCLvRA1ko34MONX3OpXozWP+ecCjL38hhK3VQ9I/1LGZixdJCTy53kNONeohLODEA0HNxutkwBkZmaaANQ0KrG/8Dd0Fm0Dh81CgbwDh060ImfPmwhc64Lg5FrcH9PicnoQfjjRghJ5J77a6oEX7YUYHdNih88KEmhANQbfA2ewaukLBvuZBAQgIyPDBODs70pEy66hvTCUALwbfxY2AiucSlxP/F0jjkO80Q1xoR5k7M7QGMq/9MZbqxcbrTD9l1ZUXenDdu+XyLcpJ8R0B9LS0kwAGPKAxPNo/jEE9a2DiCm+gegt7vgswBXypttG/WNX+iA5qiATb123DN/vFBF5VDMJ/4RzCHjdCTYCLsrO96Cj8H1TgJSUFLNF6B51CnKJPw6dvIX2gRHUJvsT5+ILPcg52Y5M8RpsFOkrndGV1fbgH80k9r+3GhH+Kw12TP9W/wjqFHfJfC72AgMESYFEIjELsP1gA6I2uWJfUSP2bn4F4etfJo5Z1R2orPsDLblBRqtRDmkQlFyPJQsFkCf5YpOkHneHNUY2GbtECPBcYgyQlJRkFiAw+ZLBsOY7H4PM6K0FHBz7+m1c6xrC1e4hvOpsC+U9DaSnu/Cx33I4LxQgtaoNXwS7Qey3ArWKQcRVKpD+iSc2eDoaAyQkJJgFiP2pGRdb/sJHvssQHehmcPJJrIebkzVke9aivL4PlRf78EAzCUc7PvxeW0xsd2RfJek4/a038bvQ/Cfij7SYzEVSEB8fb9mDKC4ujgDwFCWY11kDFqZBMTfhLF+GoAFaR4OmWXjo5ImH7yTpj+LY2FgCYHMmAlyNCtgmA7s6EtMh+WT7OKejMBWcZ/j+n+7x+Mzqo5noOoCepqGb0mGKa43RLUf0ADExMQRggXwPrB4BEGcK6C0Nx3JxiREIo3NdxDNAdf89QcYZHSMz9gz0fwFMcoRQh1TqASIjIzVisZhvd/kbzBvuRY9aC/IMoB5NqnoUwIGHbtUEXB30r6aZ8sxgZvU0eQroUzANaIX2GNogRWlp6TgVHh5eLBKJwufySTYxMYGbN28yv1LK2dl5pZeXl8zW1vYNNps932jvnlFHp9ONq9XqGw0NDXuZzWbuTeZ04D+jeOamZeIyuR18/Oh7ssff0xPTlgpsQH8OYPEd+Bcgwjx9pFe3qwAAAABJRU5ErkJggg==",
        mc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE3UlEQVRYR+2WaWzURRjGf7PbbvfqtW1pOcUg9qDuWlqhVIuVQxQkEC5JEQMxISYG5dAIop+M34yKmpj4ASGiQowEEzRWURAUG2zFLVCoFUI5CvTebbu77R5jZsuW/vkvgcRQvvB8mZl3nnnfZ945BXcZ4i7H554AMW3peovJbP8AWAI4hmVJBB4ku/sDPetE+YotnyVYUlZlPLYcYTQOS3wZDtP+2y5Cfu928WjlZl/O7DUWz8kjRAI9wyLAYLaTOqmMKz996hdllW/I7CdW0Xns55sEl0T6egn52qMlSAyJVhJsDgzmlOiYsN9DuLeDSMgPCAxJdhJtDoTJFm3HQ3rRTK4e2I4ofXaTHFGxki73QT1PSoLNbvID3czzXqWwr5cE4B+TmR+Ts6i2OsAAFUWdPD3Vw8TRYfrDAndjInt/d1B/zoYpxwVCLyLNVUHLwc8RU5a+JrMefw5P3SGtABkheMnNk90trO66hIhIwtcYBlUKwQ8FWdhmGphf4ifRG4Y+OTBhi8BnNbJ1n4P9tQ5MOU4Q0VGDSHVOp/XXnYjixRtl1vRKPHWHNYRIwEvBxb95q+Vf+uPkUBogfZkJy6wk6IogY+qucYURAulGNu4cSaPXFV0WrYByWg99iShauE5mTV+O5/gRDaGv/Sxbmmoo8HfrwkcA82jBRd/AHlBwbb5BQTRLcKDTwtt7nCRljNcKeKiM1kO7EM75L8us8qV4TlRrCIHLx/niXC0ionesBCRPNpJSaY2OkcpwE/SaDMz/MA/zyEKtgMJSWg9/jZg07yWZWbYYb/1RDcF/yc2upr/iug0h6XCk6vqcr+uVhIDZn+RiHuXU8FMKptB25BtE/lMvyoxpi/CertFm4MpJPm6qJSOsXGgRlmDPVxmwYLAK0FMGB1zwCJ7fXUhSTp5WQF4J7X/sQTw4e43MLF2At0E725D3MoubaljQ3aYTIIG29OvrrwjOTcqqx7YaO1+dKiIhJVsrIHcybdXfIibMeEFmlD5Dd4NbQ5DhfpIvHmNDyxnGB/t0nlWy/a4k0uaayMwQDJ7RIcz6qwberBqHz+5EGBM1PpJzXbRX70PcX7FKOh6ZR3djnT7Vvg7GtJxmQVczroAPsxyYpQpel2ShakQOlrERlkz1UJx9fbP29MPR8wnsqB1BcyQPozVN5zt5opOOP79DjCtfKR0lc+k5cyJuCsN9PYR62oj0eeGaAEU0mJNJsGZGr+ZQr+of8o4IA0ZzCkZbJsYkdR3rYZ9QSEfN94gxZStkeskces7UxyVqjbF1jne/D90Dt/7n2CcU0FlThRhVulymFs3Bd+6UTsC7ryzk1a17UaVCrH67ttiYeDOzjs/Hc6wKkT1lmUx3zaK3qUHHe2/9okHb2nc+46Mtq6PtDe/vQfUpW6I1NVpXtqDPE+1XNlVXfGWPB9t9uXS69yOyipfINNcMfOcbdbygf8Bh1KkllVg7VlelgrLH6kOd3MyuONZxE+ly/4LIeHihL801yxK4coFIMHAb++D/UwyJZsw5Y+ly7/eLtMK524xWx+rk3GJQT9hwQIbpbqgl3Nu+Q2BJmWobmb/NaEl/QBgSTMMSPxIOBn0dZ4PNJ9aq86IOcwGgf13unBoVV/3v6mMHVvtduXOBb/QcufWNcYfF3BNw1zPwH8Oi002+AO5EAAAAAElFTkSuQmCC",
        discover: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEPUlEQVRYR+1XXUhjRxT+Jt7EmGBcNL60W1ZXYUFtHxq1lGK1L1Xrk6B5UYl/0RARi6j4CyIkmhfri/82G1lTW8X+WJB2C9XilqLSpQ8lVrrYyq4om6irMdGY694yE65UV9kuxfjiB8OcO3PmfN+cmTlwCa4Y5Ir5cS2AdHd3h/E83wMgD0BkkI5kF8AXHMd9TLq6uu7euXOnOCMjA3K5PCj8Pp8Ps7OzWFlZsRGz2ew1Go1he3t74Hk+KAI4joNKpUJfX98BsVgsgsFggMvlCgq5SKJWqzEwMADS2dkpVFZWXomAwcFBEJPJJOj1emxvbwc1A5GRkRgeHgbp6OhgApqamuB0OhEdHQ2tVove3l5UVVVhYmKCjefk5LA5+u31elFcXIyE22r4fvsE8HvxJORt3Lv/FxoaGphPbGwsFhcX2VqK/Px8TE5OMjsmJgatra0BAe3t7UwAbenp6XA4HFAqlVhaWkJeXh5mZmaQmJjIyOlccnIys6mId+XfQxX1OmSq1+ByfIfWmQgmlBLV1dWhv78fCQkJzJ/GpLFSUlIwNzeHoaEhjI+Pg7S1tQnl5eWgFzE7Oxtra2tM9fLyMsxmM6amphgZbR6Ph/nQgNTnPek3uHHzTcij4rC5cBdfP83A2rqL+dId0qxSXypCoVCwWLSnm6CcIyMjIM3NzUwATbeIiooKRm4ymVijizQaDevn5+cZQWZmJjLfkkJY/RISiQTCzQ/xhycePT09yM3NRVZWFlpaWk5ipqWlsbWFhYVs9xaLBdPT0yCNjY1CaWkpNjY2WGBKQht9lvSpiLunNsXZb/AegPcC8mg2L677ty+1xVhi7Li4OFitVpD6+nomYHeXVsfgQHLsRpT0MUaHhkFqa2uFkpIS0Ep42SDgoXTeR/jmDCTxAmzWLZCamhomwO12Xyp/6N5D3Fj/HCG+QKZJPAebbQukurpaoG/6sgRID59Atf4ZQvdXT22Q3OZgG90CMRqNFwqIiIhgd4P2FKL9X8aiwg6g2HqA40dfAYLwQnZJrBS2ey4Qg8Eg6HQ67O/vv+A0NjbGnietihSiTZ8SnaMQbbEP8W+h+n0vhr91BNZ8EH7u0ZJbHGx2F4her2cCaJE5C7vdfjJUUFAA8Vu0aU9Bx8s+uoVw5w+QegOll6LvJw+M6coLBEhhsztBysrKLszAy24lx+8gzPUjlDsLkBx5X+Z++g68wcE27gQpKiry6nS6sKOjIwjnnNXZqIR3Q777KxTPFhDqfvxKpCfOMoLj6BB8an96QLRarTUpKakkNTUVMpns3IAS/zNIvY8gPXwAzhc42/8Dn1/Aw5/3sPT34ShRqVTvaDQaq1qtjuc47pQCzrcOmedPhPhfvUgdc0qASE7pfC5RQJBIwR8L/s0dfvWX39er6X8BLfIJAAJvLTigvPTWO8Qfk9NSgyOCsjy//jO6zsA/zRn7ZsGAFvoAAAAASUVORK5CYII="
    };

    var submit;

    var $anims = $(document.createElement("style"));
    $anims.text(
        fieldValidator.fieldSelector + " {" +
        "transition: background " + (fieldValidator.animDelay/1000) + "s linear, color " + (fieldValidator.animDelay/1000) + "s linear, border " + (fieldValidator.animDelay/1000) + "s linear;"+
        "}"
    );
    $("head").append($anims);

    function toggleButton(submitButton) {
        if (submitButton) {
            submit = $(submitButton);
        }

        var disable = !validate(true, false, false);

        function dobutton(btn) {
            console.log (btn, disable);
            if (btn.is("a")) {
                btn.css({opacity: (disable ? ".5" : "1")});
                if (disable) {
                    btn.addClass("no-hover");
                } else {
                    btn.removeClass("no-hover");
                }
            } else if (btn.is("button") || btn.is("input")) {
                btn.prop("disabled", disable);
            }
        }

        if (submit) {
            if (submit.length > 1) {
                submit.each(function () {
                   dobutton($(this));
                });
            } else {
                dobutton(submit);
            }
        }
    }

    function validate(options) {
        var lazy = (!options || options.lazy === undefined);
        if (!options) options = { showErrors: true, triggerButton: true, colorsOnly: false };
        var valid = true;

        $(fieldValidator.fieldSelector + ":visible").each(function () {
            if (lazy) {
                if ($(this).data("field-validator") === "enabled" && !$(this).data("valid")) {
                    valid = false;
                    return false;
                }
            } else {
                if ($(this).data("check") && !$(this).data("check")(options.showErrors, options.triggerButton, options.colorsOnly))
                    valid = false;
            }
        });

        return valid;
    }

    function displayValid($element, message, check, showErrors, triggerButton, colorsOnly) {
        if (check(showErrors)) {
            message.hide();
            $element.stop();

            if ($element.val().trim().length > 0) {
                if (fieldValidator.borderValid) {
                    $element.css({ "border-color": fieldValidator.borderValid });
                } else {
                    $element.css({ "border-color": $element.data("original-border-color") });
                }

                if (fieldValidator.backgroundValid) {
                    $element.css({ "background": fieldValidator.backgroundValid });
                }

                if (fieldValidator.colorValid) {
                    $element.css({ "color": fieldValidator.colorValid });
                }
            }

            $element.data("valid", true);

        } else {
            if (showErrors && !colorsOnly) {
                message.show();
                $element.stop();
            }

            if (showErrors || colorsOnly) {
                if (fieldValidator.borderInvalid) {
                    $element.css({ "border-color": fieldValidator.borderInvalid });
                }

                if (fieldValidator.backgroundInvalid) {
                    $element.css({"background": fieldValidator.backgroundInvalid});
                }

                if (fieldValidator.colorInvalid) {
                    $element.css({"color": fieldValidator.colorInvalid });
                }
            }

            $element.data("valid", false);
        }

        if (triggerButton) toggleButton();

        return $element.data("valid");
    }

    function sibling($element, otherelem, circular) {
        if (otherelem) {
            var $sibling = $(otherelem);

            if ($element.data("required-if") === undefined) {
                $element.data("required-if", $sibling);
            }

            $sibling.change(function () {
                $element.data("check")(false, true, true);
            });

            $sibling.keyup(function () {
                if (!$sibling.val() || $sibling.val().length <= 1) {
                    $element.data("check")(false, true, true);
                }
            });

            console.debug ("fieldValidator requires", fieldValidator.describe($element), "when there is",
                fieldValidator.describe($sibling));

            if (circular) {
                sibling(otherelem, $element, false);
            }
        }
    }

    function registerInput ($element) {
        if (!$element.data("validate")) {
            var required = $element[0].hasAttribute("required");
            var pattern = $element.attr("pattern");
            var message = $element.siblings(fieldValidator.errorSelector);
            var added;
            var check;
            var timer;

            function fieldOption(name) {
                return ($element.data(name) && ($element.data(name).toLowerCase() === "on" ||
                $element.data(name).toLowerCase() === "true" ||
                $element.data(name).toLowerCase() === "enabled"));
            }

            function fieldValid(showErrors, triggerButton, colorsOnly) {
                return displayValid($element, message, check, showErrors, triggerButton, colorsOnly);
            }

            function handleInput() {
                var c = fieldValidator.onvalid();
                var v = fieldValid(true, true);
                if (v && c) c($element);
                return v;
            }

            function textInput(custom) {
                function trimit() {
                    if ($element.val()) {
                        $element.val($element.val().trim());
                    }
                }

                var normalize = [];

                if ($element.data("format") === "titlecase") {
                    normalize.push (function (){
                        $element.val($element.val().toTitleCase());
                    });

                } else if ($element.data("format") === "lowercase") {
                    normalize.push (function (){
                        $element.val($element.val().toLowerCase());
                    });

                } else if ($element.data("format") === "uppercase") {
                    normalize.push(function (){
                        $element.val($element.val().toUpperCase());
                    });
                }

                if ($element.data("pad") && /^[0-9]*$/.test($element.data("pad"))) {
                    normalize.push(function (){
                        $element.val($element.val().pad(parseInt($element.data("pad")), $element.data("pad-with")));
                    });
                }

                if (custom) {
                    normalize.push(custom);
                }

                $element.keydown(function () {
                    $element.stop();
                    $element.css({
                        color: $element.data("original-text-color"),
                        borderColor: $element.data("original-border-color")
                    });
                });

                $element.keyup(function () {
                    clearTimeout(timer);
                    if ($element.val() && $element.val().length > 0) {
                        timer = window.setTimeout(function() { handleInput() }, fieldValidator.inputDelay);
                    } else {
                        message.hide();
                    }
                });

                $element.blur(function () {
                    clearTimeout(timer);
                    trimit();

                    if (handleInput() && $element.val().length > 0) {
                        $(normalize).each(function () {
                            this();
                        });
                    }
                });
            }

            function createCheck(usePatterns) {
                return function(logErrors) {
                    var sibling = $element.data("required-if");
                    var siblingvalues = $element.data("required-values");
                    var siblingdataname = $element.data("required-dataname");
                    var passedrequired = (!required || $element.val() && $element.val().length > 0);
                    var passedpattern = (!usePatterns || !pattern || !$element.val() || $element.val().length === 0 ||
                    (new RegExp(pattern).test($element.val())));
                    var passedsibling = true;

                    if (sibling) {
                        if (siblingvalues) {
                            var values = siblingvalues.split(",");
                            for (var idx in values) {
                                if ((siblingdataname && $(sibling).find(":selected").data(siblingdataname) === values[idx].trim()) ||
                                    (!siblingdataname && $(sibling).val() === values[idx])) {
                                    passedsibling = ($element.val()) ? true : false;
                                    break;
                                }
                            }
                        } else {
                            if ($(sibling).val()) {
                                passedsibling = ($element.val()) ? true : false;
                            }
                        }
                    }

                    if (logErrors) {
                        if (!passedrequired) console.debug ("fieldValidator required field not entered",
                            fieldValidator.describe($element));
                        if (!passedpattern) console.debug ("fieldValidator failed pattern match",
                            fieldValidator.describe($element, true));
                        if (!passedsibling) console.debug ("fieldValidator requires field",
                            fieldValidator.describe($element), "because of required-if",
                            fieldValidator.describe(sibling));
                    }

                    if (!$element.data("valid") && passedrequired && passedpattern && passedsibling) {
                        console.log ("fieldValidator VALID ::", fieldValidator.describe($element));
                    }

                    return (passedrequired && passedpattern && passedsibling)
                }
            }

            if ($element.is("select")) {
                $element.data("field-validator", "enabled");

                check = createCheck(false /* Will not test using the pattern attribute value even if provided. */);

                $element.click(function() {
                    $element.stop();
                    $element.css({
                        color: $element.data("original-text-color"),
                        borderColor: $element.data("original-border-color")
                    });
                });

                $element.change(function() {
                    handleInput();
                });

                $element.blur(function() {
                    handleInput();
                });

                added = true;

            } else if ($element.is("input") && $element.data("type") === "money") {
                pattern = PATTERNS.money;

                check = createCheck(true /* Will use the pattern attribute value. */);

                var delim = ".";
                if ($element.data("decimal") && /^[.,]$/.test($element.data("decimal"))) {
                    delim = $element.data("decimal");
                }

                textInput(function () {
                    var val = $element.val();
                    if (val.length > 0) {
                        if (val.indexOf(delim) === -1) {
                            val = val + delim + "00";
                        }
                        if (delim != ",") {
                            val = val.replace(/[ ,']/g, '');
                        } else {
                            val = val.replace(/[ .']/g, '');
                        }
                        $element.val(val);
                    }
                });

                added = true;

            } else if ($element.is("input") && $element.data("type") === "date") {
                var parsed;
                var formatted;

                check = function(logErrors) {
                    var require = (!required || ($element.val() && $element.val().length > 0));

                    if (!require) {
                        return false;
                    } else if ($element.val().length === 0) {
                        return true;
                    }

                    function fail() {
                        if (logErrors) {
                            console.log(fieldValidator.describe($element), "date value " + $element.val() + " could not be parsed.");
                        }
                        return false;
                    }

                    try {
                        parsed = new Date($element.val());
                        if (isNaN(parsed.getDate())) {
                            return fail();
                        }
                        if (parsed.getFullYear() === 2001) {
                            if ($element.val().indexOf("01") !== $element.val().length - 2) {
                                parsed.setFullYear(new Date().getFullYear());
                            }
                        }
                        formatted = (parsed.getMonth() + 1).toString().pad(2) + "/" + parsed.getDate().toString().pad(2) + "/" +
                            parsed.getFullYear();
                        console.log("Parsed " + $element.val() + " as date " + formatted);
                        return true;

                    } catch (e) {
                        return fail();
                    }
                };

                textInput(function () {
                    $element.val(formatted);
                });

                added = true;

            } else if ($element.is("input") && $element.data("type") === "phone") {
                check = function () {
                    return ($element.val().length === 0 && !required) ||
                        (/[0-9\-\s]+/.test($element.val()) && $element.val().replace(/[^0-9]/g, "").length === 10);
                };

                textInput(function () {
                    var val = $element.val();
                    val = val.replace(/[^0-9]/g, "");
                    $element.val(val);
                });

                added = true;

            } else if ($element.is("input") && $element.data("type") === "creditcard") {

                function luhnAlgorithm(value) {
                    if (/[^0-9-\s]+/.test(value)) return false;

                    var nCheck = 0, nDigit = 0, bEven = false;
                    value = value.replace(/\D/g, "");

                    for (var n = value.length - 1; n >= 0; n--) {
                        var cDigit = value.charAt(n),
                            nDigit = parseInt(cDigit, 10);

                        if (bEven) {
                            if ((nDigit *= 2) > 9) nDigit -= 9;
                        }

                        nCheck += nDigit;
                        bEven = !bEven;
                    }

                    return (nCheck % 10) == 0;
                }

                check = function (logErrors) {
                    var require = (!required || ($element.val() && $element.val().length > 0));
                    var empty = ($element.val().length === 0);

                    var icons = fieldOption("cardicon");

                    if (empty) {
                        if (icons) {
                            $element.css({ background: "none" });
                        }
                    }

                    if (require && empty) return true;
                    if (!require) return false;

                    var luhn = luhnAlgorithm($element.val());

                    if (logErrors) {
                        if (!luhn) console.debug (fieldValidator.describe($element), "card number is not valid, failed luhn algorithm.");
                    }

                    if (luhn) {
                        var oncard;

                        if ($element.data("oncardtype")) {
                            if (typeof $element.data("oncardtype") === "function") {
                                oncard = $element.data("oncardtype");
                            } else if (typeof window[$element.data("oncardtype")] === "function") {
                                oncard = window[$element.data("oncardtype")];
                            }
                        }

                        function showicon(img) {
                            if (icons) {
                                $element.css({ background: "url(" + img + ")", backgroundRepeat: "no-repeat",
                                    backgroundPosition: "98% center" });
                            }
                        }

                        if (/^4/.test($element.val())) {
                            if (oncard) oncard("Visa");
                            showicon(IMG.visa);
                            return true;

                        } else if (/^51/.test($element.val()) || /^55/.test($element.val()) ||
                            /^2221/.test($element.val()) || /^2720/.test($element.val())){
                            if (oncard) oncard("MasterCard");
                            showicon(IMG.mc);
                            return true;

                        } else if (/^34/.test($element.val()) || /^37/.test($element.val())) {
                            if (oncard) oncard("AMEX");
                            showicon(IMG.amex);

                            var amex = ($element.data("amex")) ? fieldOption($element.data("amex")) : true;
                            return amex;

                        } else if (/^6/.test($element.val())) {
                            if (/^6011/.test($element.val()) || /^65/.test($element.val()) ||
                                (parseInt($element.val().substr(0,6)) >= 622126 && parseInt($element.val().substr(0,6)) <= 622925) ||
                                (parseInt($element.val().substr(0,3)) >= 644 && parseInt($element.val().substr(0,3)) <= 649)) {

                                if (oncard) oncard("Discover");
                                showicon(IMG.discover);
                            }

                            var discover = ($element.data("discover")) ? fieldOption($element.data("discover")) : true;
                            return discover;
                        }

                        return false;

                    } else {
                        if (icons) {
                            $element.css({ background: "none" });
                        }
                    }
                };

                textInput();

                added = true;

            } else if ($element.is("textarea") || ($element.is("input") && ($element.attr("type") === "text"))) {
                $element.data("field-validator", "enabled");

                if ($element.data("type") === "email") pattern = PATTERNS.email;


                check = createCheck(true /* Will use the pattern attribute value. */);

                textInput();

                added = true;
            }

            if (added) {
                console.debug ("fieldValidator activated:", fieldValidator.describe($element));

                $element.data("check", fieldValid);
                $element.data("original-border-color", $element.css("borderColor"));
                console.log ($element.data("original-border-color"));
                $element.data("original-text-color", $element.css("color"));

                if ($element.data("required-if")) {
                    sibling($element, $element.data("required-if"));
                }

                message.hide();

                if ($element.val() && $element.val().length > 0) {
                    fieldValid(false, false);
                } else {
                    $element.data("valid", !required);
                }
            }
        }
    }

    // Grab currently available form fields.
    $(fieldValidator.fieldSelector).each(function() {
        registerInput ($(this));
    });

    // Create a mutation observer to automatically hook up any dynamically added form fields.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                $(node).find(fieldValidator.fieldSelector).each(function() {
                    registerInput ($(this));
                });
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

    $.fn.requiredif = function(elem, circular) {
        var $field = $(this);

        function registerSibling() {
            if ($field.data("field-validator") === "enabled") {
                sibling($field, $(elem), circular);
                return true;
            }
        }

        if (!registerSibling()) {
            window.setTimeout(function () {
                if (!registerSibling()) {
                    console.log ("Element is not a field-validator instance.", fieldValidator.describe($field));
                }
            }, 500);
        }
    };

    fieldValidator.toggleButton = toggleButton;
    fieldValidator.validate = validate;
});
