/*******************
 * Suitelet Script 
 *******************/

function createPage(request, response) {
    if (request.getMethod() == 'GET') {
        var form = nlapiCreateForm('Item History', true);
        form.setScript('customscript_so_suitelet_history_c');
        form.addButton('custpage_additems', 'Add to Order', 'addItems();');
        var customerField = form.addField('customer', 'integer', 'customer').setDisplayType('hidden');
        var customer = request.getParameter('cust');
        customerField.setDefaultValue(customer);
        var addByPrice = form.addField('custpage_addbyprice', 'checkbox', 'Match Last Purchase Price');
        addByPrice.setDefaultValue('T');

        //sublists for item history 
        var historyList = form.addSubList('history', 'list', 'Item History');
        historyList.addField('additem', 'integer', 'Add Qty').setDisplayType('entry');
        historyList.addField('item', 'select', 'Item', 'item').setDisplayType('inline');
        historyList.addField('qty', 'float', 'Qty Purchased')
        historyList.addField('datepurchased', 'date', 'Date Last Purchased');
        historyList.addField('orderedby', 'select', 'Ordered By', 'contact').setDisplayType('inline');
        historyList.addField('rate', 'currency', 'Price Last Purchased');
        historyList.addField('margin', 'float', 'Margin').setDisplayType('inline');

        //search by transaction 
        var salesorderSearch = nlapiSearchRecord("salesorder", null,
            [
                ["type", "anyof", "SalesOrd"],
                "AND",
                ["mainline", "is", "F"],
                "AND",
                ["shipping", "is", "F"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["quantity", "isnotempty", ""],
                "AND",
                ["customermain.internalidnumber", "equalto", customer],
                "AND",
                ["item.isinactive", "is", "F"]
            ],
            [
                new nlobjSearchColumn("trandate", null, "MAX"),
                new nlobjSearchColumn("item", null, "GROUP"),
                new nlobjSearchColumn("quantity", null, "SUM").setSort(true)
            ]
        );

        if (salesorderSearch != null && salesorderSearch != '') {
            for (var i = 0; salesorderSearch != null && i < salesorderSearch.length && i < 100; i++) {

                var result = salesorderSearch[i];
                var item = result.getValue("item", null, "GROUP");

                var pricingSearch = nlapiSearchRecord("salesorder", null,
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["customermain.internalidnumber", "equalto", customer],
                        "AND",
                        ["quantity", "isnotempty", ""],
                        "AND",
                        ["item.internalid", "anyof", item]
                    ],
                    [
                        new nlobjSearchColumn("trandate").setSort(true),
                        new nlobjSearchColumn("rate"),
                        new nlobjSearchColumn("custcol_gs_margin"),
                        new nlobjSearchColumn("custbodyso_ordered_by")
                    ]
                );

                var pricing = pricingSearch[0];

                historyList.setLineItemValue('item', i + 1, item);
                historyList.setLineItemValue('qty', i + 1, result.getValue("quantity", null, "SUM"));
                historyList.setLineItemValue('datepurchased', i + 1, result.getValue("trandate", null, "MAX"));
                historyList.setLineItemValue('orderedby', i + 1, pricing.getValue("custbodyso_ordered_by"));
                historyList.setLineItemValue('rate', i + 1, pricing.getValue("rate"));
                historyList.setLineItemValue('margin', i + 1, pricing.getValue("custcol_gs_margin"));
            }
        }

        response.writePage(form);
    }
}

/****************
 * Client Script 
 ****************/
function addItems() {
    for (var i = 0; i < nlapiGetLineItemCount('history'); i++) {

        if (nlapiGetLineItemValue('history', 'additem', i + 1) >= 1) {
            window.opener.nlapiSelectNewLineItem('itemlist');
            var itemID = nlapiGetLineItemValue('history', 'item', i + 1);
            var itemQty = nlapiGetLineItemValue('history', 'additem', i + 1);
            window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_item', itemID, true, true);
            window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_quantity', itemQty, true, true);
            
            if (nlapiGetFieldValue('custpage_addbyprice') == 'T'){
                var custPrice = nlapiGetLineItemValue('history', 'rate', i + 1);
                window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_cust_price', custPrice, true, true);
            }
            
            window.opener.nlapiCommitLineItem('itemlist', true);
        }
    }

    setWindowChanged(window, false);
    window.close();
}

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