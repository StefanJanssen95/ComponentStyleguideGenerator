# Styleguide generator


## Custom documentation format (.sgd)
This is just a text file with a ``.sgd`` extension (although other extensions will work as well). Each component has to be documented in a seperate file. This file will be read and converted to the documentation.
A ``.sgd`` file can look like the following:
```
== name ==
SpecialButton

== path ==
src/components/button/special.vue

== description ==
Really <strong>special</strong> button.

== props ==
rainbow | boolean   | true      | Should every letter be a different color?
comic   | boolean   | true      | Should the font be comic sans or inherit?
size    | enum      | normal    | One of: small, normal, large

== import ==
import SpecialButton from "components/Button/Special.vue";
```
Each section within this file has a header pre- and suffixed with ``==`` with optional whitespaces within these tags. This header will be used as a replacement tag in the template files.  
Only the ``name`` tag is required, the other tags can be used whenever you need them.

The content is plain text, but HTML can be used in here as well. When in need for a table you can make it with HTML or make it using the table syntax. For the table syntax to work you need to enable this for the section in the config file.  
Each row is placed on a different line, and cells are seperated with a pipecharacter ``|``. Whitespaces around the cell content will be removed so formatting within the file can be done as well.

## Config file
```json
{
    "project": {
        "name": "Test styleguide" // Required
    },
    "templateDir": "./templates/", // Required
    "componentsDir": "./components/", // Required
    "styleDir": "./templates/css/", // Required
    "destDir": "./build/",// Required
    "templates": {
        "main": "styleguide.html", // Required
        "component":{
            "file": "component.html", // Required
            "sections":{ // Required
                "description": {
                    "file": "component/description.html" // Required
                },
                "props": {
                    "file": "component/propsTable.html", // Required
                    "type": "table", // Optional, possible values: "table"
                    "row": "component/propsRow.html" // Optional, use when you have table your rows have special styling
                },
                "slots": {
                    "file": "component/slotsTable.html",
                    "type": "table"
                },
                "import": {
                    "file": "component/import.html"
                }
            }
        },
        "navigation": "navigation.html", // Required
        "navigationItem": "navItem.html" // Required
    },
    "DEBUG": false // optional, default: false
}
```
In the ``templates.component.sections`` each key references the tag in the ``.sgd`` files and the replacement tag in the template files.


## Templates

## Styleguide template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>{{css}}</style>
    <title>Styleguide</title>
</head>
<body>
    {{sidebar}}
    <div class="main__padding">
        <main class="main">
            {{components}}
        </main>
    </div>
</body>
</html>
```
The styleguide template requires three tags. ``css``, ``sidebar``, ``components``.  
The ``css`` tag includes each css file within the style folder which is configured from the config.  
The sidebar template will replace the  ``sidebar`` tag.  
The ``components`` tag will be replace by all documentation about the components.

### Sidebar template


### Component template
Each file within the components folder will be converted to the component template and concatted to eachother.
```html
<section class="component" id="section_{{keyName}}">
    <header class="component__header">
        <h2 class="component__title"><a href="#section_{{keyName}}" class="component__title-prefix">#</a>{{name}}</h2>
        <span class="component__path">{{path}}</span>
    </header>
    {{description}}
    {{props}}
    {{slots}}
    {{import}}
</section>
<hr>
```
Besides the ``keyName`` and ``name`` tag all tags can be dynamically added or changed using the config and `.sgd` files. ``keyName`` is a lowercase version of the name and is used as a special identifier for the component.

