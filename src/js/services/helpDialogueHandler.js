angular.module('services').factory('helpDialogueHandler', function () {

    var ENV = window.globalConfig;
    var dialogueMaps = {
        "Adding_a_data_class":"Adding_a_data_class",
        "Adding_comments":"Adding_comments",
        "Create_a_new_model":"Create_a_new_model",
        "Creating_a_new_type":"Creating_a_new_type",
        "Edit_model_details":"Edit_model_details",
        "Editing_properties":"Editing_properties",
        "Exporting_models":"Exporting_models",
        "Importing_DataModels_Using_XML":"Importing_DataModels_Using_XML",
        "Importing_DataModels_Using_Excel":"Importing_DataModels_Using_Excel",
        "Importing_DataFlows_Using_Excel":"Importing_DataFlows_Using_Excel",


        "Importing_models":"Importing_models",
        "Preferences":"Preferences",
        "Registering_as_a_new_user":"Registering_as_a_new_user",
        "Responding_to_an_email_invitation":"Responding_to_an_email_invitation",

        "Search_Help":"Search_Help",
        "User_profile":"User_profile",


        "Browsing_models":"Browsing_models",


        "Terminology_details":"Terminology_details",
        "Term_details":"Term_details",
    };

    var importerMaps = {
        "XmlImporterService" : "Importing_DataModels_Using_XML",
        "ExcelDataModelImporterService": "Importing_DataModels_Using_Excel",
    };

    return {

        getImporterHelp: function(importerName){
            return importerMaps[importerName];
        },

        open: function (name, position) {
            if(!dialogueMaps[name]){
                return;
            }
            jQuery( "#helpDialog" ).remove();

            var wikiLink = ENV.wiki;
            if(wikiLink && wikiLink[wikiLink.length-1] == '/'){
                wikiLink = wikiLink.substr(0, name.length-1);
            }
            wikiLink = wikiLink + "/index.php?title="+ dialogueMaps[name];
            var contentWikiLink = wikiLink + "&action=render";


            var dialogue =
                "<div id=\"helpDialog\"  style='overflow:hidden;width:100%;height: 100%' title=\"Basic dialog\">\n" +
                    "<div style='margin-left: 20px;'><a  style='font-weight: bold;' target='_blank'  href='" + wikiLink + "'>Open in New Window</a></div>"+
                    "<iframe name='helpFrame' id='helpFrame' style='width:100%;height: 100%;border:0;' src= '"+ contentWikiLink + "'></iframe>\n" +
                "</div>";
            jQuery( dialogue ).dialog({
                modal: false,
                width:400,
                height:600,
                position: position,
                title:"Help",
                resizable: true,
                open: function (event, ui) {
                    jQuery('.ui-dialog').css('z-index',1000);
                    jQuery('.ui-widget-overlay').css('z-index',1000);
                    jQuery(".ui-dialog-titlebar").addClass("themeBackground");
                    jQuery(".ui-dialog-titlebar").css("color","#fff");
                },
                close: function (event, ui) {
                    jQuery( "#helpDialog" ).remove();
                }
            });
            jQuery( "#helpDialog" ).dialog( "moveToTop");

            jQuery("#helpFrame").bind("load",function(){

            });

        },
    };
});
