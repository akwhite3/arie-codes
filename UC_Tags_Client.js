/*******************
 * 
 * *Tags Client Script*
 
  Used to support Tag custom record
  Allows the user to add tags to a customer/contact record 
  Appropriately displays the tags, which are clickable and bring the user to a list of applicable records 
 *
 ******************/

function pageLoad(type) {
    //make sure the fields start blank 
    var record = nlapiGetRecordType();

    if (record != '' && record != '') {
        if (record != 'customer' && record != 'job') {
            //display the customer tags 
            var customerID = nlapiGetFieldValue('company');
            var msg = "";
            var tagArray = new Array();
            var skip = false;

            if (customerID != null && customerID != "") {
                try {
                    var customerRecord = nlapiLoadRecord('customer', customerID);
                    if (customerRecord != null && customerRecord != '') {
                        var tagArray = new Array();
                        tagArray = customerRecord.getFieldValues('custentity_tags_applied');
                        if (tagArray != null && tagArray != '') {
                            for (var i = 0; i < tagArray.length && tagArray.length > 0; i++) {
                                var tagRecord = nlapiLoadRecord('customrecord_customer_tags', tagArray[i]);
                                var name = tagRecord.getFieldValue('name');
                                msg += name;
                                msg += '<br>';
                            }
                        }
                    }
                }
                catch (e) {
                    skip = true;
                }
            }
            nlapiSetFieldValue('custentity_customer_tag_display', msg);
        }
    }
}
function fieldChange(type, field) {

    var add = nlapiGetFieldValue('custentity_tag_add');
    var remove = nlapiGetFieldValue('custentity_tag_remove');
    var tag;
    var selected = new Array();
    var fieldName;
    var tagField;

    if (nlapiGetRecordType() == 'customer' || nlapiGetRecordType() == 'lead' || nlapiGetRecordType() == 'job') {
        tag = nlapiGetFieldValue('custentity_tag_choices');
        tagField = 'custentity_tag_choices';
        selected = nlapiGetFieldValues('custentity_tags_applied');
        fieldName = 'custentity_tags_applied';
    }
    else {
        tag = nlapiGetFieldValue('custentity_contact_tags');
        tagField = 'custentity_contact_tags';
        selected = nlapiGetFieldValues('custentity_contact_tags_applied');
        fieldName = 'custentity_contact_tags_applied';
    }

    //get value from the dropdown 
    if (field == tagField) {
        //if  'custentity_tag_add' is selected, add it to the 'custentity_tags_applied' box 
        if (add == 'T' && remove == 'F' && (tag != null && tag != '')) {
            addOption(selected, tag, fieldName);
            resetList(tagField);
        }
        else if (add == 'F' && remove == 'T' && tag != null) {
            //deselects the item from the list 
            //search for the value in the array and take it out 
            removeOption(selected, tag, fieldName);
            resetList(tagField);
        }
        else {
            //do nothing - can not add and remove at the same time 
        }
    }

    if (field == 'custentity_tag_add') {
        if (tag != null) {
            if (add == 'T' && remove == 'F') {
                addOption(selected, tag, fieldName);
                resetList(tagField);
            }
            else if (add == 'F' && remove == 'T') {
                removeOption(selected, tag, fieldName);
                resetList(tagField);
            }
            else {
                //do nothing 
            }
        }
    }

    if (field == 'custentity_tag_remove') {
        if (tag != null) {
            if (add == 'T' && remove == 'F') {
                addOption(selected, tag, fieldName);
                resetList(tagField);
            }
            else if (add == 'F' && remove == 'T') {
                removeOption(selected, tag, fieldName);
                resetList(tagField);
            }
            else {
                //do nothing 
            }
        }
    }
}

function resetList(tagField) {
    nlapiSetFieldValue(tagField, "", false);
    nlapiSetFieldValue('custentity_tag_add', 'F', false);
    nlapiSetFieldValue('custentity_tag_remove', 'F', false);
}

function addOption(selected, tag, fieldName) {
    selected.push(tag);
    nlapiSetFieldValues(fieldName, selected, false);
}

function removeOption(selected, tag, fieldName) {
    var index = selected.length;
    for (var i = 0; i < index; i++) {
        if (selected[i] == tag) {
            selected.splice(i, 1);
        }
    }
    nlapiSetFieldValues(fieldName, selected, false);
}
