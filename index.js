exports.build = function(){
    let fs = require('fs');

    // Load config
    let config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

    // set directories
    const projectDir = "./";
    const destDir = "./build/";
    const templateDir = config.templateDir;
    const componentsDir = config.componentsDir;
    const DEBUG = config.DEBUG || false;

    // Preload template files
    const componentTemplate = fs.readFileSync(templateDir + config.templates.component.file, "utf-8");
    const navigationItem = fs.readFileSync(templateDir+config.templates.navigationItem,'utf-8');
    let sectionTemplates = {};
    for( let section in config.templates.component.sections ){
        sectionTemplates[section] = fs.readFileSync(templateDir + config.templates.component.sections[section].file, "utf-8");
    }

    // main replacement variables
    let styleguide = fs.readFileSync(templateDir+config.templates.main,'utf-8');
    let navigation = fs.readFileSync(templateDir+config.templates.navigation,'utf-8');
    let mainContent = "";
    let css = "";
    let navigationList = "";


    // Concat CSS
    console.log("Preparing CSS")
    let cssFiles = fs.readdirSync(config.styleDir);
    for( let i=0; i<cssFiles.length; i++){
        css += fs.readFileSync(config.styleDir + cssFiles[i],'utf-8');
    }

    console.log("Preparing components")
    // Generate all component documentation and navigationitems
    let componentList = fs.readdirSync(componentsDir)
    for( let i=0; i<componentList.length; i++){
        let componentData = readComponentData(componentsDir + componentList[i]);

        // create the unique key for each section
        mainContent += componentTemplate.replace(/{{keyName}}/g,componentData.name.toLowerCase());
        // add navigation item for this component
        navigationList += navigationItem
            .replace("{{keyName}}",componentData.name.toLowerCase())
            .replace("{{name}}",componentData.name);

        for( name in componentData ){
            section = sectionTemplates[name];
            let replaceTo = componentData[name];
            if( config.templates.component.sections[name] ){
                // Convert it to table if its a table type
                if( config.templates.component.sections[name].type === "table" ){
                    let tableData = convertToJsonTable(componentData[name]);
                    let tableHTML = "";
                    // Generate the rows
                    if( config.templates.component.sections[name].row ){
                        rowTemplate = fs.readFileSync(templateDir + config.templates.component.sections[name].row, "utf-8");
                        for( let i=0; i<tableData.length; i++){
                            tableHTML += rowTemplate;
                            for( let j=0; j<tableData[i].length; j++){
                                tableHTML = tableHTML.replace("{{slot_"+j+"}}", tableData[i][j] );
                            }
                        }
                    } else {
                        for( let i=0; i<tableData.length; i++){
                            tableHTML += "<tr>";
                            for( let j=0; j<tableData[i].length; j++){
                                tableHTML += "<td>"+tableData[i][j]+"</td>";
                            }
                            tableHTML += "</tr>";
                        }
                    }
                    replaceTo = sectionTemplates[name].replace("{{rows}}",tableHTML);
                } else { // if the section has a special template
                    replaceTo = section.replace("{{"+name+"}}", componentData[name]);
                }
            }
            mainContent = mainContent.replace("{{"+name+"}}", replaceTo);
        }
        mainContent = removeUnusedTags(mainContent);
    }
    console.log("Building the sidebar")
    navigation = navigation
        .replace("{{project_name}}",config.project.name)
        .replace("{{navItems}}",navigationList);

    console.log("Generating the masterpiece");
    // combine everything to finish the masterpiece
    styleguide = styleguide
        .replace("{{components}}", mainContent)
        .replace("{{sidebar}}",navigation)
        .replace("{{css}}",css);

    styleguide = removeUnusedTags(styleguide);

    if( !fs.existsSync(destDir) ){
        fs.mkdirSync(destDir);
    }
    fs.writeFileSync(destDir+"styleguide.html",styleguide,'utf-8'); 

    // FUNCTIONS :D
    function readComponentData(fileName){
        fileContent = fs.readFileSync(fileName, "utf-8").trim();
        let fileData = {};
        while( fileContent.length > 0 ){
            let data = retrieveComponentSection();
            fileData[data.name] = data.content;
        }
        return fileData;
    }

    //Remove/highlight unused tags
    function removeUnusedTags(str){
        if( DEBUG ){
            return str.replace(/{{(.*)}}/g,`<span style="display: inline-block; width: 100%; height: 100%; background: purple; color: red;">!!$1!!</span>`);
        } else {
            return str.replace(/({{.*}})/g,'');
        }
    }
    function retrieveComponentSection(){
        let openTag = fileContent.indexOf("==", 0);
        let closeTag = fileContent.indexOf("==", openTag+3);
        let nextOpenTag = fileContent.indexOf("==", closeTag+3);
        nextOpenTag = nextOpenTag !== -1 ? nextOpenTag : fileContent.length;

        let name = fileContent.substring(openTag+2, closeTag).trim();
        let content = fileContent.substring(closeTag+2, nextOpenTag).trim();
        fileContent = fileContent.substr(nextOpenTag);
    
        return {name, content};
    }

    function convertToJsonTable(data){
        let table = [];
        let rows = data.split("\r\n");
        for( let i=0; i<rows.length; i++){
            table[i] = rows[i].trim().split("|");
            for( let j=0; j<table[i].length; j++){
                table[i][j] = table[i][j].trim();
            }
        }
        return table;
    }
}