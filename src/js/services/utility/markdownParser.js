'use strict';

//add children element into model and class as Tree view needs that,
//we will remove this, once we design a customized Tree view
angular.module('services').factory("markdownParser", function ($window, elementTypes) {

    //FD: FD|FD-ID[2]

    //CS: CS|CS-ID[2]

    //DM: DM|DM-ID[2]

    //DC: DC|DM-ID[2]|DC-ID[3]
    //    DC|DM-ID[2]|PDC-ID[3]|DC-ID[4]

    //DE: DE|DM-ID[2]|DC-ID[3]|DE-ID[4]
    //DT: DT|DM-ID[2]|DT-ID[3]

    //TM: TM|TG-ID[2]|TM-ID[3]
    //TG: TG|TG-ID[2]

    var factoryObject = {};
    factoryObject.initialised = false;

    factoryObject.htmlRenderer = function () {
        var marked = $window.marked;
        var renderer = new marked.Renderer();

        renderer.link = function (href, title, text) {

            if (href && href.indexOf("MC|") === 0) {
                var link = factoryObject.createLink(href, title, text);
                return '<a href="' + link + '" target="_blank">' + text + '</a>';
            }
            //return the actual format if it does not star with MC
            return '<a href="' + href+ '" target="_blank">' + text + '</a>';
        };

        //just reduce header tags for one level
        renderer.heading = function(text, level, rawtext){
            var  l = level + 1;
            return "<h" + l + ">" + text + "</h" + l + ">";
        };


        renderer.table = function(header, body){
            var table = '<table class="table table-bordered table-condensed">';
            table += header + body;
            table+= '</table>';
            return table;
        };

        return renderer;
    };



    // &#63; to ? helper
    factoryObject.htmlEscapeToText = function (text) {

        return text.replace(/\&\#[0-9]*;|&amp;/g, function (escapeCode) {

            if (escapeCode.match(/amp/)) {

                return '&';

            }

            return String.fromCharCode(escapeCode.match(/[0-9]+/));

        });
    },


        // return a custom renderer for marked.
        factoryObject.textRenderer = function () {
            var marked = $window.marked;
            var render = new marked.Renderer();

            // render just the text of a link
            render.code = function (code, language, escaped) {
                return code;
            };

            render.codespan = function (code, language, escaped) {
                return code;
            };

            // render just the text of a link
            render.strong = function (text) {
                return text;
            };

            // render just the text of a link
            render.link = function (href, title, text) {
                return text;
            };

            render.html = function(html){
                return '';
            },

                // render just the text of a paragraph
                render.paragraph = function (text) {
                    return factoryObject.htmlEscapeToText(text)+'\r\n';
                };

            // render just the text of a heading element, but indecate level
            render.heading = function (text, level) {
                return text;
            };

            // render nothing for images
            render.image = function (href, title, text) {
                return '';
            };

            render.table = function(header){
                var table = '<br>[';
                var reg = /<th>(.*?)<\/th>/g;
                var match;
                while (match = reg.exec(header)) {
                    table += (match[1] ? match[1] : "...") + ", ";
                }
                table +="...]";
                return table;
            };

            return render;
        };

    factoryObject.parse = function (source, renderType) {
        if ($window.marked) {

            var renderer = factoryObject.htmlRenderer();
            if(renderType === "text"){
                renderer = factoryObject.textRenderer();
            }

            var marked = $window.marked;
            marked.setOptions({
                renderer: renderer,
                gfm: true,
                breaks: true,
                sanitize: true,
                sanitizer: function (code) {
                    return code;
                }
            });
            return marked(source);
        } else {
            return "Markdown parser not found!";
        }
    };

    factoryObject.createMarkdownLink = function (element) {
        var baseTypes = elementTypes.getTypes();

        var dataTypeNames = elementTypes.getTypesForBaseTypeArray("DataType").map(function (dt) {
            return dt.id;
        });

        var str = "[" + element.label + "](MC|" + baseTypes[element.domainType].markdown + "|";

        if(element.domainType === "Folder"){
            str += element.id;
        }

        if(element.domainType === "Classifier"){
            str += element.id;
        }

        if(element.domainType === "DataModel"){
            str += element.id;
        }


        var dataModelId = element.dataModel;
        if(!dataModelId && element.breadcrumbs){
            dataModelId = element.breadcrumbs[0].id;
        }

        var parentDataClassId = null;
        if(element.parentDataClass){
            parentDataClassId = element.parentDataClass;
        }else if(element.dataClass){
            parentDataClassId = element.dataClass;
        }else if(element.breadcrumbs){
            parentDataClassId = element.breadcrumbs[element.breadcrumbs.length - 1].id;
        }


        if(element.domainType === "DataType" || dataTypeNames.indexOf(element.domainType) !== -1){
            str += dataModelId + "|" + element.id;
        }


        if(element.domainType === "EnumerationValue"){
            str += dataModelId + "|" + element.dataType;
        }

        if(element.domainType === "DataClass" && !parentDataClassId) {
            str += dataModelId + "|" + element.id;
        }

        if(element.domainType === "DataClass" && parentDataClassId){

            str += dataModelId + "|" + parentDataClassId + "|" + element.id;
        }

        if(element.domainType === "DataElement"){
            str += dataModelId + "|" + parentDataClassId + "|" + element.id;
        }

        if(element.domainType === "Terminology"){
            str += element.id;
        }

        if(element.domainType === "Term"){
            str += element.terminology + "|" + element.id;
        }


        str += ")";
        return str;
    };

    factoryObject.createLink = function(href, title, text) {
        var elements = href.split("|");
        var elementType = elements[1];
        var mcElement = {};

        if (elementType === "FD") {
            mcElement = {
                id: elements[2],
                domainType: "Folder"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "CS") {
            mcElement = {
                id: elements[2],
                domainType: "Classifier"
            };
            return elementTypes.getLinkUrl(mcElement);
        }


        if (elementType === "DM") {
            mcElement = {
                id: elements[2],
                domainType: "DataModel"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "DC") {
            mcElement = {
                dataModel: elements[2],
                parentDataClass: (elements.length === 5 ? elements[3] : null),
                id: (elements.length === 5 ? elements[4] : elements[3]),
                domainType: "DataClass"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "DT" || elementType === "EV" ) {
            mcElement = {
                dataModel: elements[2],
                id: elements[3],
                domainType: "DataType"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "DE") {
            mcElement = {
                dataModel: elements[2],
                dataClass: elements[3],
                id: elements[4],
                domainType: "DataElement"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "TM") {
            mcElement = {
                terminology: elements[2],
                id: elements[3],
                domainType: "Term"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "TG") {
            mcElement = {
                id: elements[2],
                domainType: "Terminology"
            };
            return elementTypes.getLinkUrl(mcElement);
        }

    };

    return factoryObject;

});

