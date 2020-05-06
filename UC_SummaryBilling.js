/*************************
 *  *UC Summary Billing*
 *  Created by: Arie White 
 *************************/

/*************************
 * ***Suitelet Script*** *
 *************************/
function buildSuitelet(request, response) {

    if (request.getMethod() == 'GET') {

        var form = nlapiCreateForm("Summary Billing");
        form.setScript('customscript_summarybilling_c');
        form.setScript('customscript_summarybilling_ue');

        //get the parameters passed
        var customer = request.getParameter('customer');
        var project = request.getParameter('project');
        var start = request.getParameter('start');
        var end = request.getParameter('end');
        var po = request.getParameter('po');

        //Page 1: Select Customer 
        if (customer == null || customer == '') {

            var htmlHeader = form.addField('custpage_header', 'inlinehtml').setLayoutType('outsideabove', 'startrow');
            var headHTML = '<div style ="font-size:120%;"><br>Select a customer to continue</div>';
            htmlHeader.setDefaultValue(headHTML);

            var customerField = form.addField('customers', 'select', 'Customer', 'customer').setMandatory(true);
            form.addButton('nextpage', 'Continue', 'nextPage();')
        }

        //Page 2: Search Criteria 
        else {
            form.addFieldGroup('custpage_searchfilters', 'Search Criteria');
            form.addFieldGroup('custpage_selected', 'Selected Documents');

            var customerField = form.addField('customers', 'select', 'Customer', 'customer', 'custpage_searchfilters').setDisplayType('inline');
            customerField.setMandatory(true);
            customerField.setDefaultValue(customer);
            customerField.setLayoutType("startrow", "startrow");
            var projectField = form.addField('project', 'select', 'Project', 'job', 'custpage_searchfilters').setLayoutType("startrow", "startrow");
            var startField = form.addField('startdate', 'date', 'Start Date', null, 'custpage_searchfilters');
            var placeHolder = form.addField('placeholder', 'inlinehtml', ' ', null, 'custpage_searchfilters');
            placeHolder.setDefaultValue('<br><Br><br>')

            var poField = form.addField('custpage_po', 'text', 'PO#', null, 'custpage_searchfilters');
            var endField = form.addField('enddate', 'date', 'End Date', null, 'custpage_searchfilters');
            form.addField('selected', 'multiselect', ' ', 'transaction', 'custpage_selected');

            form.addButton('findinvoices', 'Search', 'findInvoices();');
            form.addButton('changecust', 'Select New Customer', 'changeCustomer();')
            form.addResetButton();
            form.addSubmitButton('Submit');

            //create header for page 
            var htmlHeader = form.addField('custpage_header', 'inlinehtml').setLayoutType('outsideabove', 'startrow');
            var headHTML = '<div style ="font-size:120%;"><ol>'
                + '<u><b>To Use</b></u>: <br>'
                + '<li>Enter desired search criteria.</li>'
                + '<li>Click <i>Search</i> to view applicable invoices.</li>'
                + '<li>Select invoices and credit memos to be consolidated.</li>'
                + '<li>Submit to generate consolidated invoice.</li>'
                + '</ol></div>';
            htmlHeader.setDefaultValue(headHTML);

            //sublist to display items 
            //invoices
            var invoicelist = form.addSubList('invoiceitems', 'list', 'Invoices');
            invoicelist.addField('custpage_select', 'checkbox', 'Select');
            invoicelist.addField('custpage_date', 'date', 'Date');
            invoicelist.addField('custpage_docnum', 'select', 'Invoice No.', 'transaction').setDisplayType('disabled');
            invoicelist.addField('custpage_project', 'text', 'Project');

            var statusField = invoicelist.addField('custpage_status', 'select', 'Status').setDisplayType('inline');
            statusField.addSelectOption('open', 'Open');
            statusField.addSelectOption('pendingApproval', 'Pending Approval');
            statusField.addSelectOption('paidInFull', 'Paid In Full');

            invoicelist.addField('custpage_tracking', 'text', 'Tracking').setDisplayType('hidden');
            invoicelist.addField('custpage_po', 'text', 'PO/Check ID');
            invoicelist.addField('custpage_internalid', 'integer', 'InternalID').setDisplayType('hidden');
            invoicelist.addField('custpage_tranid', 'text', 'Tran ID').setDisplayType('hidden');
            invoicelist.addMarkAllButtons();

            //credit memos 
            var memolist = form.addSubList('creditmemos', 'list', 'Credit Memos');
            memolist.addField('custpage_select', 'checkbox', 'Select');
            memolist.addField('custpage_date', 'date', 'Date');
            memolist.addField('custpage_docnum', 'select', 'Credit Memo No.', 'transaction').setDisplayType('disabled');
            memolist.addField('custpage_project', 'text', 'Project');

            var cmStatus = memolist.addField('custpage_status', 'select', 'Status').setDisplayType('inline');
            cmStatus.addSelectOption('open', 'Open');
            cmStatus.addSelectOption('applied', 'Fully Applied');

            memolist.addField('custpage_tracking', 'text', 'Tracking').setDisplayType('hidden');
            memolist.addField('custpage_po', 'text', 'PO/Check ID');
            memolist.addField('custpage_internalid', 'integer', 'InternalID').setDisplayType('hidden');
            memolist.addField('custpage_tranid', 'text', 'Tran ID').setDisplayType('hidden');
            memolist.addMarkAllButtons();

            //search criteria 

            if (start == null || start == '') {
                start = '01/01/2000';
            }

            if (end == null || end == '') {
                var today = new Date();
                end = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            }

            //conducts the search 


            if (po != null && po != '') {
                if (project == '' || project == null) {
                    var transactionSearch = nlapiSearchRecord("transaction", null,
                        [
                            ["type", "anyof", "CustInvc", "CustCred"],
                            "AND",
                            ["customermain.internalid", "anyof", customer],
                            "AND",
                            ["trandate", "onorafter", start],
                            "AND",
                            ["trandate", "onorbefore", end],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["poastext", "contains", po],
                            "AND",
                            ["status", "anyof", "CustCred:B", "CustCred:A", "CustInvc:A", "CustInvc:B", "CustInvc:D"]//,
                            //"AND",
                            //["custbody_cb_linked.custrecord_cb_status", "anyof", "@NONE@", "3"]
                            //["custbody_cb_linked","is","@NONE@"]
                        ],
                        [
                            new nlobjSearchColumn("trandate").setSort(true),
                            new nlobjSearchColumn("tranid"),
                            new nlobjSearchColumn("type"),
                            new nlobjSearchColumn("custbody_ava_customerentityid"),
                            new nlobjSearchColumn("companyname", "jobMain"),
                            new nlobjSearchColumn("internalid"),
                            new nlobjSearchColumn("otherrefnum"),
                            new nlobjSearchColumn("trackingnumbers"),
                            new nlobjSearchColumn("statusref")
                        ]
                    );
                }

                else {
                    var transactionSearch = nlapiSearchRecord("transaction", null,
                        [
                            ["type", "anyof", "CustInvc", "CustCred"],
                            "AND",
                            ["customermain.internalid", "anyof", customer],
                            "AND",
                            ["trandate", "onorafter", start],
                            "AND",
                            ["trandate", "onorbefore", end],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["jobmain.internalidnumber", "equalto", project],
                            "AND",
                            ["poastext", "contains", po],
                            "AND",
                            ["status", "anyof", "CustCred:B", "CustCred:A", "CustInvc:A", "CustInvc:B", "CustInvc:D"]//,
                            //"AND",
                            //["custbody_cb_linked.custrecord_cb_status", "anyof", "@NONE@", "3"]
                        ],
                        [
                            new nlobjSearchColumn("trandate").setSort(true),
                            new nlobjSearchColumn("tranid"),
                            new nlobjSearchColumn("type"),
                            new nlobjSearchColumn("custbody_ava_customerentityid"),
                            new nlobjSearchColumn("companyname", "jobMain"),
                            new nlobjSearchColumn("internalid"),
                            new nlobjSearchColumn("otherrefnum"),
                            new nlobjSearchColumn("trackingnumbers"),
                            new nlobjSearchColumn("statusref")
                        ]
                    );
                }
            }
            else {
                if (project == '' || project == null) {
                    var transactionSearch = nlapiSearchRecord("transaction", null,
                        [
                            ["type", "anyof", "CustInvc", "CustCred"],
                            "AND",
                            ["customermain.internalid", "anyof", customer],
                            "AND",
                            ["trandate", "onorafter", start],
                            "AND",
                            ["trandate", "onorbefore", end],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["status", "anyof", "CustCred:B", "CustCred:A", "CustInvc:A", "CustInvc:B", "CustInvc:D"]//,
                            //"AND",
                            //["custbody_cb_linked.custrecord_cb_status", "anyof", "@NONE@", "3"]
                            //["custbody_cb_linked","is","@NONE@"]
                        ],
                        [
                            new nlobjSearchColumn("trandate").setSort(true),
                            new nlobjSearchColumn("type"),
                            new nlobjSearchColumn("tranid"),
                            new nlobjSearchColumn("custbody_ava_customerentityid"),
                            new nlobjSearchColumn("companyname", "jobMain"),
                            new nlobjSearchColumn("internalid"),
                            new nlobjSearchColumn("otherrefnum"),
                            new nlobjSearchColumn("trackingnumbers"),
                            new nlobjSearchColumn("statusref")
                        ]
                    );
                }

                else {
                    var transactionSearch = nlapiSearchRecord("transaction", null,
                        [
                            ["type", "anyof", "CustInvc", "CustCred"],
                            "AND",
                            ["customermain.internalid", "anyof", customer],
                            "AND",
                            ["trandate", "onorafter", start],
                            "AND",
                            ["trandate", "onorbefore", end],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["jobmain.internalidnumber", "equalto", project],
                            "AND",
                            ["status", "anyof", "CustCred:B", "CustCred:A", "CustInvc:A", "CustInvc:B", "CustInvc:D"]//,
                            //"AND",
                            //["custbody_cb_linked.custrecord_cb_status", "anyof", "@NONE@", "3"]
                        ],
                        [
                            new nlobjSearchColumn("trandate").setSort(true),
                            new nlobjSearchColumn("type"),
                            new nlobjSearchColumn("tranid"),
                            new nlobjSearchColumn("custbody_ava_customerentityid"),
                            new nlobjSearchColumn("companyname", "jobMain"),
                            new nlobjSearchColumn("internalid"),
                            new nlobjSearchColumn("otherrefnum"),
                            new nlobjSearchColumn("trackingnumbers"),
                            new nlobjSearchColumn("statusref")
                        ]
                    );
                }
            }


            //search 
            //only run if there are some search criteria 

            //display search criteria 
            if (transactionSearch != null && transactionSearch != '') {
                //fill the list
                if (transactionSearch.length > 75) {
                    //var resultDisplay = form.addField('manyresults', 'text').setDisplayType('inline');
                    var resultDisplay = form.addField('manyresults', 'inlinehtml');
                    resultDisplay.setDefaultValue('<br><br><B>Only displaying the 75 most recent transactions. Enter more criteria to narrow your search.</b>');
                    resultDisplay.setLayoutType('outsidebelow', 'startrow')
                }

                invoiceCount = 1;
                creditCount = 1;
                for (var i = 0; i < transactionSearch.length && i < 75; i++) {
                    var result = transactionSearch[i];

                    //only display if there are no active cb linked 
                    if (result.getValue('type') == 'CustInvc') {
                        invoicelist.setLineItemValue('custpage_date', invoiceCount, result.getValue('trandate'));
                        invoicelist.setLineItemValue('custpage_status', invoiceCount, result.getValue('statusref'));
                        invoicelist.setLineItemValue('custpage_tranid', invoiceCount, result.getValue('tranid'));
                        invoicelist.setLineItemValue('custpage_docnum', invoiceCount, result.getValue('internalid'));
                        invoicelist.setLineItemValue('custpage_tracking', invoiceCount, result.getValue('trackingnumbers'));
                        invoicelist.setLineItemValue('custpage_customer', invoiceCount, result.getValue("custbody_ava_customerentityid"));
                        invoicelist.setLineItemValue('custpage_po', invoiceCount, result.getValue("otherrefnum"));

                        var jobID = result.getValue("companyname", "jobMain");
                        if (jobID != null && jobID != '') {
                            invoicelist.setLineItemValue('custpage_project', invoiceCount, jobID);
                        }
                        var invoiceID = result.getValue('internalid');
                        var invoiceURL = nlapiResolveURL('RECORD', 'invoice', invoiceID, 'VIEW');
                        invoicelist.setLineItemValue('custpage_url', invoiceCount, invoiceURL);
                        invoicelist.setLineItemValue('custpage_internalid', invoiceCount, invoiceID);

                        invoiceCount++;
                    }
                    else {
                        memolist.setLineItemValue('custpage_date', creditCount, result.getValue('trandate'));
                        memolist.setLineItemValue('custpage_status', creditCount, result.getValue('statusref'));
                        memolist.setLineItemValue('custpage_tranid', creditCount, result.getValue('tranid'));
                        memolist.setLineItemValue('custpage_docnum', creditCount, result.getValue('internalid'));
                        memolist.setLineItemValue('custpage_tracking', creditCount, result.getValue('trackingnumbers'));
                        memolist.setLineItemValue('custpage_customer', creditCount, result.getValue("custbody_ava_customerentityid"));
                        memolist.setLineItemValue('custpage_po', creditCount, result.getValue("otherrefnum"));

                        var jobID = result.getValue("companyname", "jobMain");
                        if (jobID != null && jobID != '') {
                            memolist.setLineItemValue('custpage_project', creditCount, jobID);
                        }
                        var memoID = result.getValue('internalid');
                        var memoURL = nlapiResolveURL('RECORD', 'creditmemo', memoID, 'VIEW');
                        memolist.setLineItemValue('custpage_url', creditCount, memoURL);
                        memolist.setLineItemValue('custpage_internalid', creditCount, memoID);

                        creditCount++;
                    }
                }
            }
        }
        response.writePage(form);
    }

    //create the bill
    if (request.getMethod() == 'POST') {
        //create the bill record 
        var bill = nlapiCreateRecord('customrecord_summarybill');
        var id = nlapiSubmitRecord(bill, true);
        var tracking = '';
        var projects = new Array();
        var flag = false;

        //get the selected bills and submit them to a consolidated bill record
        var selectedBills = new Array();
        selectedBills = request.getParameter('selected');

        var selected = new Array();
        var str5 = String.fromCharCode(5);
        selected = selectedBills.split(str5);

        for (var i = 0; i < selected.length; i++) {
            var transactionID = selected[i];

            //get invoice and get each line item and fill in the line item record
            try {
                var transaction = nlapiLoadRecord('invoice', transactionID);
                type = 'invoice';
            }
            catch (e) {
                var transaction = nlapiLoadRecord('creditmemo', transactionID);
                type = 'creditmemo';
            }

            //get linked array to update cb info 
            var linked = new Array();
            try {
                linked = transaction.getFieldValues("custbody_cb_linked");
                linked.push(id);
                transaction.setFieldValues('custbody_cb_linked', linked);
            }
            catch (e) {//possibly pose an issue with length of array(testing) 
            }

            //add tracking numbers to bill
            if (type == 'invoice') {
                if (transaction.getFieldValue('trackingnumbers') != null && transaction.getFieldValue('trackingnumbers') != '') {
                    tracking += transaction.getFieldValue('trackingnumbers') + ', ';
                }
            }
            if (type == 'creditmemo') {
                if (transaction.getFieldValue('custbody_linked_tracking') != null && transaction.getFieldValue('custbody_linked_tracking') != '') {
                    tracking += transaction.getFieldValue('custbody_linked_tracking') + ', ';
                }
            }

            //check for a common project
            if (transaction.getFieldValue('job') != '' && transaction.getFieldValue('job') != null) {
                projects.push(transaction.getFieldValue('job'));
            }
            else {
                flag = true;
            }

            //Create consolidated Bill Line Record 
            for (var j = 0; j < transaction.getLineItemCount('item'); j++) {
                var lineItem = nlapiCreateRecord('customrecord_sb_lineitem');
                var itemID = transaction.getLineItemValue('item', 'item', j + 1);
                var itemSearch = nlapiSearchRecord("item", null,
                    [
                        ["internalidnumber", "equalto", itemID]
                    ],
                    [
                        new nlobjSearchColumn("isinactive")
                    ]
                );

                if (itemSearch != null && itemSearch != '') {
                    var result = itemSearch[0];
                    var inactive = result.getValue('isinactive');

                    if (inactive == 'T') {
                        var itemID = 39496;
                        lineItem.setFieldValue('custrecord_sb_item', itemID); //item
                    }
                    else {
                        lineItem.setFieldValue('custrecord_sb_item', itemID); //item
                    }
                }

                var shipped = changeToNum(transaction.getLineItemValue('item', 'quantity', j + 1));
                var ordered = changeToNum(transaction.getLineItemValue('item', 'quantityordered', j + 1));
                var unitprice = changeToNum(transaction.getLineItemValue('item', 'rate', j + 1));

                lineItem.setFieldValue('custrecord_cb_number', id);
                lineItem.setFieldValue('custrecord_sb_description', transaction.getLineItemValue('item', 'description', j + 1));
                lineItem.setFieldValue('custrecord_sb_shipped', shipped);
                lineItem.setFieldValue('custrecord_sb_unit_price', unitprice);
                lineItem.setFieldValue('custrecord_sb_tranid', transactionID);
                lineItem.setFieldValue('custrecord_sb_total', transaction.getLineItemValue('item', 'amount', j + 1));

                if (transaction.getRecordType() == 'invoice') {
                    lineItem.setFieldValue('custrecord_sb_ordered', ordered);
                    lineItem.setFieldValue('custrecord_sb_unit_remaining', (ordered - shipped));
                }
                nlapiSubmitRecord(lineItem, true);
            }
        }

        //check for common project 
        var prevProj = '';
        var projectCount = 0;
        if (!flag) {
            for (var i = 0; projects != null && i < projects.length; i++) {
                if (projects[i] != prevProj) {
                    projectCount++
                    prevProj = projects[i];
                }
            }
        }

        //initialize values 
        var cb = nlapiLoadRecord('customrecord_summarybill', id);
        tracking = tracking.slice(0, -2);
        cb.setFieldValue('custrecord_sb_linkedtracking', tracking);
        if (projectCount == 1) {
            cb.setFieldValue('custrecord_summarybill_project', projects[0]);
        }
        cb.setFieldValue('custrecord_customer', request.getParameter('customers'));
        cb.setFieldValue('custrecord_sb_date', new Date());
        cb.setFieldValues('custrecord_inv_included', selected);

        //redirect to the bill page after creation 
        nlapiSubmitRecord(cb, true, true);
        nlapiSetRedirectURL('RECORD', 'customrecord_summarybill', id, true);
    }
}


/*************************
 * ****Client Script******
 *************************/

function pageInit() {
    var itemsSelected = getUrlVars()['selected'];
    var selection = new Array();

    if (itemsSelected != null && itemsSelected != '') {
        selection = itemsSelected.split(',');
    }

    nlapiSetFieldValues('selected', selection, false);
}

function findInvoices() {

    //build URL to reload the page 
    var environment = '3610164';
    var url = 'https://' + environment + '.app.netsuite.com/app/site/hosting/scriptlet.nl?script=518&deploy=1';

    var context = nlapiGetContext();
    if (context.getEnvironment() == 'SANDBOX') {
        environment = '3610164-sb1'
        url = 'https://' + environment + '.app.netsuite.com/app/site/hosting/scriptlet.nl?script=591&deploy=1';
    }

    //get fields and send them as parameters
    var customer = nlapiGetFieldValue('customers');
    var project = nlapiGetFieldValue('project');
    var start = nlapiGetFieldValue('startdate');
    var end = nlapiGetFieldValue('enddate');
    var po = nlapiGetFieldValue('custpage_po');
    var selected = nlapiGetFieldValues('selected');

    url += '&customer=' + customer;
    url += '&project=' + project;
    url += '&start=' + start;
    url += '&end=' + end;
    url += '&po=' + po;
    url += '&selected=' + selected;

    try {
        setWindowChanged(window, false);
        window.location.href = url;
    }
    catch (e) {
        alert('Error=' + e.message);
    }
}

function nextPage() {
    //build URL to reload the page 
    var environment = '3610164';
    var url = 'https://' + environment + '.app.netsuite.com/app/site/hosting/scriptlet.nl?script=518&deploy=1';
    var customer = nlapiGetFieldValue('customers');

    var context = nlapiGetContext();
    if (context.getEnvironment() == 'SANDBOX') {
        environment = '3610164-sb1'
        url = 'https://' + environment + '.app.netsuite.com/app/site/hosting/scriptlet.nl?script=591&deploy=1';
    }
    url += '&customer=' + customer;

    try {
        setWindowChanged(window, false);
        window.location.href = url;
    }
    catch (e) {
        alert('Error=' + e.message);
    }
}

function changeCustomer() {
    //build URL to reload the page 
    var environment = '3610164';
    var url = 'https://' + environment + '.app.netsuite.com/app/site/hosting/scriptlet.nl?script=518&deploy=1';
    var customer = nlapiGetFieldValue('customers');

    var context = nlapiGetContext();
    if (context.getEnvironment() == 'SANDBOX') {
        environment = '3610164-sb1'
        url = 'https://' + environment + '.app.netsuite.com/app/site/hosting/scriptlet.nl?script=591&deploy=1';
    }

    if (confirm('If you select a different customer none of your progress will be saved. Would you like to continue?')) {
        try {
            setWindowChanged(window, false);
            window.location.href = url;
        }
        catch (e) {
            alert('Error=' + e.message);
        }
    }
}

function beforeSave() {
    //get the invoices selected 

    var selectedItems = new Array();
    selectedItems = nlapiGetFieldValues('selected');


    if (selectedItems[0] != '') {
        if (selectedItems.length >= 2) {
            return true;
        }
        else {
            alert('Please select more than one document to continue.');
        }
    }
    else {
        alert('You have not selected any items.');
    }
}

//Change the number provided to a Float
function changeToNum(num) {
    if (num != null && num != '' && !isNaN(parseFloat(num))) {
        num = parseFloat(num);
    }
    else {
        //Value was blank or not a number
        num = 0;
    }

    return num;
}

function onChange(type, field, linenum) {

    if (field == 'custpage_select') {

        var selected = new Array();
        selected = nlapiGetFieldValues('selected');

        var tranactionID = nlapiGetCurrentLineItemValue(type, 'custpage_docnum');

        if (nlapiGetCurrentLineItemValue(type, field) == 'T') {
            //add the item to the selected list
            selected.push(tranactionID);
        }
        else {
            var index = selected.length;
            for (var i = 0; i < index; i++) {
                if (selected[i] == tranactionID) {
                    selected.splice(i, 1);
                }
            }
        }
        nlapiSetFieldValues('selected', selected, false);
    }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
