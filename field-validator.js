
// The initial api for configuring the validator is available immediately.
var fieldValidator = function(){
    var handler;

    return {
        fieldSelector: ".form-control",
        errorSelector: ".form-error",

        inputDelay: 1000,
        animDelay: 500,

        colorValid: "#1414B8",
        colorInvalid: "red",

        describe: function (element, value) {
            return "<" + $(element)[0].tagName + "/> " + ($(element).attr("id") || $(element).attr("name")) + (!value ? "" : ": " + $(element).val());
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


// We initialize all the validator core functionality after the document loads.
$(document).ready (function(){
    const PATTERNS = {
        email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    };

    var submit;

    function toggleButton(submitButton) {
        if (submitButton) {
            submit = $(submitButton);
        }

        var disable = !validate(true, false, false);

        if (submit) {
            if (submit.is("a")) {
                submit.css({opacity: (disable ? ".5" : "1")});
                if (disable) {
                    submit.addClass("no-hover");
                } else {
                    submit.removeClass("no-hover");
                }
            } else if (submit.is("button") || submit.is("input")) {
                submit.prop("disabled", disable);
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
                if ($(this).data("check") && !$(this).data("check")(options.showErrors, options.triggerButton, options.colorsOnly)) valid = false;
            }
        });

        return valid;
    }

    function displayValid($element, message, check, showErrors, triggerButton, colorsOnly) {
        if (check(showErrors)) {
            message.hide();
            $element.stop();
            $element.css({ borderColor: $element.data("original-border-color") });
            $element.animate({ color: fieldValidator.colorValid }, fieldValidator.animDelay);

            $element.data("valid", true);

        } else {
            if (showErrors && !colorsOnly) {
                message.show();
                $element.stop();
            }

            if (showErrors || colorsOnly) {
                $element.animate({ color: fieldValidator.colorInvalid }, fieldValidator.animDelay, function() {
                    $element.css({ borderColor: fieldValidator.colorInvalid });
                });
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

            console.debug ("fieldValidator requires", fieldValidator.describe($element), "when there is", fieldValidator.describe($sibling));

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

            function fieldValid(showErrors, triggerButton, colorsOnly) {
                return displayValid($element, message, check, showErrors, triggerButton, colorsOnly);
            }

            function handleInput() {
                var c = fieldValidator.onvalid();
                if (fieldValid(true, true) && c) c($element);
            }

            function createCheck(usePatterns) {
                return function(logErrors) {
                    var sibling = $element.data("required-if");
                    var passedrequired = (!required || $element.val() && $element.val().length > 0);
                    var passedpattern = (!usePatterns || !pattern || !$element.val() || $element.val().length === 0 || (new RegExp(pattern).test($element.val())));
                    var passedsibling = (!sibling || !$(sibling).val() || $(sibling).val().length === 0 || ($element.val() && $element.val().length > 0));

                    if (logErrors) {
                        if (!passedrequired) console.debug ("fieldValidator required field not entered", fieldValidator.describe($element));
                        if (!passedpattern) console.debug ("fieldValidator failed pattern match", fieldValidator.describe($element, true));
                        if (!passedsibling) console.debug ("fieldValidator requires field", fieldValidator.describe($element), "because of required-if", fieldValidator.describe(sibling));
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

                added = true;

            } else if ($element.is("textarea") || ($element.is("input") && ($element.attr("type") === "text") || $element.attr("type") === "email")) {
                $element.data("field-validator", "enabled");

                if ($element.attr("type") === "email") pattern = PATTERNS.email;

                var timer;

                check = createCheck(true /* Will use the pattern attribute value. */);

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
                    handleInput();
                });

                added = true;
            }

            if (added) {
                console.debug ("fieldValidator activated:", fieldValidator.describe($element));

                $element.data("check", fieldValid);
                $element.data("original-border-color", $element.css("borderColor"));
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
                sibling($field, elem, circular);
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
