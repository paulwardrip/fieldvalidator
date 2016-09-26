# fieldvalidator
A slick, responsive form validator for jQuery that checks a field when the user stops typing or moves on to the next field. When a field is valid the text fades to blue, when invalid the text and border change to red and an error message can be displayed, these effects are removed when the user starts typing again. It uses the html required and pattern attributes. There is also support for declaring fields that are only required when a related field has a value. The library automatically finds all the inputs on the page, including any that are added to the page dynamically at any time.

optional files
* xsdoptions.js : allows you to populate select boxes using an enumeration from an xsd.
* titlecase.js : a string prototype that provides the function toTitleCase().

todo
* make selector for inputs and selector for error messages configurable.
* make colors and timing values configurable.
* implement commonly used validations as input type values, such as creditcard money, etc (email is currently provided).
* implement normalization (fixing the values the user types).
