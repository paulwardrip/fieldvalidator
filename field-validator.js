var fieldValidator;

$(document).ready (function(){
    const DELAY = 1000;

    const PATTERNS = {
        email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    };

    const COLOR = {
        valid: "#1414B8",
        invalid: "red"
    };

    var submit;

    function describe(element, value) {
        return "<" + $(element)[0].tagName + "/> " + ($(element).attr("id") || $(element).attr("name")) + (!value ? "" : ": " + $(element).val());
    }

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

        $(".form-control:visible").each(function () {
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
            $element.animate({ color: COLOR.valid }, 200);

            $element.data("valid", true);

        } else {
            if (showErrors && !colorsOnly) {
                message.show();
                $element.stop();
            }

            if (showErrors || colorsOnly) {
                $element.animate({ color: COLOR.invalid }, 200, function() {
                    $element.css({ borderColor: COLOR.invalid });
                });
            }

            $element.data("valid", false);
        }

        if (triggerButton) toggleButton();
    }

    function addSibling($element, otherelem) {
        if (otherelem) {
            var sibling = $(otherelem);

            sibling.change(function () {
                $element.data("check")(false, true, true);
                //toggleButton();
            });
            sibling.keyup(function () {
                if (sibling.val().length <= 1) {
                    $element.data("check")(false, true, true);
                }
                //toggleButton();
            });

            console.debug ("fieldValidator requires", describe($element), "when there is", describe(sibling));
        }
    }

    function registerInput ($element) {
        if (!$element.data("validate")) {
            var required = $element[0].hasAttribute("required");
            var pattern = $element.attr("pattern");
            var message = $element.siblings(".form-error");
            var added;
            var check;

            function fieldValid(showErrors, triggerButton, colorsOnly) {
                displayValid($element, message, check, showErrors, triggerButton, colorsOnly);
            }

            function createCheck(usePatterns) {
                return function(logErrors) {
                    var sibling = $element.data("required-if");
                    var passedrequired = (!required || $element.val() && $element.val().length > 0);
                    var passedpattern = (!usePatterns || !pattern || $element.val().length === 0 || (new RegExp(pattern).test($element.val())));
                    var passedsibling = (!sibling || $(sibling).val().length === 0 || $element.val().length > 0);

                    if (logErrors) {
                        if (!passedrequired) console.debug ("fieldValidator required field not entered", describe($element));
                        if (!passedpattern) console.debug ("fieldValidator failed pattern match", describe($element, true));
                        if (!passedsibling) console.debug ("fieldValidator requires field", describe($element), "because of required-if", describe(sibling));
                    }

                    if (!$element.data("valid") && passedrequired && passedpattern && passedsibling) {
                        console.log ("fieldValidator VALID ::", describe($element));
                    }

                    return (passedrequired && passedpattern && passedsibling)
                }
            };

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
                    fieldValid(true, true);
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
                    if ($element.val().length > 0) {
                        timer = window.setTimeout(function() { fieldValid(true, true) }, DELAY);
                    } else {
                        message.hide();
                    }
                });

                $element.blur(function () {
                    clearTimeout(timer);
                    fieldValid(true, true);
                });

                added = true;
            }

            if (added) {
                console.debug ("fieldValidator activated:", describe($element));

                $element.data("check", fieldValid);
                $element.data("original-border-color", $element.css("borderColor"));
                $element.data("original-text-color", $element.css("color"));

                if ($element.data("required-if")) {
                    addSibling($element, $element.data("required-if"));
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
    $(".form-control").each(function() {
        registerInput ($(this));
    });

    // Create a mutation observer to automatically hook up any dynamically added form fields.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                $(node).find(".form-control").each(function() {
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

    $.fn.requiredif = function(elem) {
        var $field = $(this);

        if (elem) {
            if ($field.data("field-validator") === "enabled") {
                $field.data("required-if", elem);
                addSibling($field, elem);

            } else {
                window.setTimeout(function () {
                    if ($field.data("field-validator") === "enabled") {
                        $field.data("required-if", elem);
                        addSibling($field, elem);
                    } else {
                        console.log ("Element is not a field-validator instance.", describe($field));
                    }
                }, 500);
            }
        }
    };

    fieldValidator = {
        toggleButton: toggleButton,
        validate: validate
    };

});
