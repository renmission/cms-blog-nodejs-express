const Handlebars = require('handlebars');

Handlebars.registerHelper('trimString', function (passedString) {
    var theString = passedString.substring(0, 150) + '...';
    return new Handlebars.SafeString(theString)
});