/************************************************************* 
// Margin Calculator 
// By: Arie White
// Suitlet & Client scripts 

This script is used to calculate margins for various items and pricing levels 

- used as a tool for sales executives and is also utilized as a popup window, available from the order entry screen. 
- The user is able to price items and directly add the item at the specified pricing by button click

/************************************************************* */

function userRequest(request, response) {
    //get request 

    if (request.getMethod() == 'GET') {

        var mode = request.getParameter('mode');
        if (mode != 'so') {
            var form = nlapiCreateForm('Margin Calculator', false);
        }
        else {
            var form = nlapiCreateForm('Margin Calculator', true);
        }

        form.addButton('customreset', 'Reset', 'resetValues();');
        var htmlHeader = form.addField('custpage_header', 'inlinehtml').setLayoutType('outsideabove', 'startrow');
        var htmlText = "<big><p><big>How to use:</big></p>";
        htmlText += "Select an item or enter a purchase cost<br>";
        htmlText += "Enter in the price margin<br> ";
        htmlText += "Use the reset button to zero out the fields<br><br>";
        htmlText += "*Prices shown reflect the rate per unit<br></big>"
        htmlHeader.setDefaultValue(htmlText);

        form.setTitle('Margin Calculator');
        form.setScript('customscript_uc_margincalc');

        if (mode == 'so') {
            form.addFieldGroup('item_info', 'Item Information').setSingleColumn(true);
        }
        else {
            form.addFieldGroup('item_info', 'Item Information');
        }

        form.addFieldGroup('image_field', ' ');
        form.addFieldGroup('calculator_info', 'Margin Calculator');

        form.addField('margin_item', 'select', 'Select an Item', 'item', 'item_info');
        var itemImage = form.addField('custpage_margin_item', 'inlinehtml', 'image_field');
        itemImage.setDefaultValue("<p> </p>");
        itemImage.setLayoutType('endrow', 'none');

        var marginField = form.addField('margin', 'float', 'Margin (%)', null, 'calculator_info');
        marginField.setDefaultValue(0);
        marginField.setLayoutType('startrow');
        var discountField = form.addField('discount', 'float', 'Discount (%)', null, 'calculator_info');
        discountField.setDefaultValue(0);
        discountField.setLayoutType('endrow');
        form.addField('purchase_price', 'currency', 'Our Cost ($)', null, 'calculator_info').setDefaultValue(0);

        if (mode != 'so') {
            form.addField('scansource_qty', 'text', 'Scansource Qty', null, 'item_info').setDisplayType("disabled");
            form.addField('jenne_qty', 'text', 'Jenne Qty', null, 'item_info').setDisplayType("disabled");
            form.addField('useforformat', 'text', '', null, 'item_info').setDisplayType("inline");
            form.addField('synnex_qty', 'text', 'Synnex Qty', null, 'item_info').setDisplayType("disabled");
            form.addField('ingram_qty', 'text', 'Ingram Qty', null, 'item_info').setDisplayType("disabled");
        }
        else { form.addField('itemquantity', 'integer', 'Quantity', null, 'calculator_info').setDefaultValue(1); }

        //drop down box for pricing 
        var select = form.addField('pricing', 'select', 'Item Pricing', 'pricelevel', 'item_info');
        select.setDefaultValue(1);

        var sellPriceField = form.addField('sell_price', 'float', 'Selling Price ($)', null, 'calculator_info');
        sellPriceField.setDefaultValue(0);
        sellPriceField.setLayoutType('startrow');
        var listField = form.addField('list', 'float', 'List ($)', null, 'calculator_info');
        listField.setDefaultValue(0);
        listField.setLayoutType('endrow');
        listField.setDisplayType('inline');
        form.addField('profit', 'float', 'Profit ($)', null, 'calculator_info').setDefaultValue(0);

        form.addField('msg_box', 'text', ' ', null, 'item_info').setDisplayType('inline');

        if (mode == 'so') {
            form.addButton('add_to_order', 'Add to Order', "addToSalesOrder()")

        }
        response.writePage(form);
    }
}

/******************************
 *  Client Script - The calculations 
 **************************/
function resetValues() {
    //Blank out everything
    nlapiSetFieldValue('margin_item', '', false);
    nlapiSetFieldValue('custpage_margin_item', '', false);
    nlapiSetFieldValue('margin', 0, false);
    nlapiSetFieldValue('discount', 0, false);
    nlapiSetFieldValue('purchase_price', 0, false);
    nlapiSetFieldValue('sell_price', 0, false);
    nlapiSetFieldValue('list', 0, false);
    nlapiSetFieldValue('profit', 0, false);
    nlapiSetFieldValue('purchase_price', 0, false);
    nlapiSetFieldValue('scansource_qty', '', false);
    nlapiSetFieldValue('jenne_qty', '', false);
    nlapiSetFieldValue('synnex_qty', 0, false);
    nlapiSetFieldValue('ingram_qty', 0, false);
    nlapiSetFieldValue('pricing', 1, false);
    nlapiSetFieldValue('msg_box', '', false);
    nlapiSetFieldValue('itemquantity', 1, false);
}

function addToSalesOrder() {
    var itemID = nlapiGetFieldValue('margin_item');
    var selling = nlapiGetFieldValue('sell_price');

    window.opener.nlapiSelectNewLineItem('itemlist');
    var pricelevel = nlapiGetLineItemValue('pricing');
    window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_item', itemID, true, true);
    //window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_recalc', 'T', true, true);
    window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_cust_price', selling, true, true);
    window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_totalprice', selling, true, true);

    var qty = nlapiGetFieldValue('itemquantity');
    if (qty >= 1) {
        window.opener.nlapiSetCurrentLineItemValue('itemlist', 'custpage_quantity', qty, true, true);
        window.opener.nlapiCommitLineItem('itemlist', true);
        resetValues();
    }
    else {
        alert('Please enter a valid quantity');
    }

    /*do {
        qty = prompt('Please enter a quantity:', 1);
    } while (qty == '' || isNaN(qty) || qty <= 0);

    //Exit if no qty
    if (qty == '' || qty == null) {
        alert('Invalid qty. Try again.');
        return false;
    }*/
}

function onChange(type, field) {
    /*Calculate the answers*/
    /*Get values from the fields*/
    var margin = parseFloat(nlapiGetFieldValue('margin'));
    var discount = parseFloat(nlapiGetFieldValue('discount'));
    var purchaseprice = parseFloat(nlapiGetFieldValue('purchase_price'));
    var list = parseFloat(nlapiGetFieldValue('list'));
    var profit = parseFloat(nlapiGetFieldValue('profit'));
    var sellingprice = parseFloat(nlapiGetFieldValue('sell_price'));
    var itemID = nlapiGetFieldValue('margin_item');
    var priceField = nlapiGetFieldValue('pricing');
    var price;
    var cost;
    var search;
    var filterExpression;
    var vendorID;
    var found = false;
    var column = new Array();
    column[0] = new nlobjSearchColumn('internalid');
    column[1] = new nlobjSearchColumn('name');
    column[2] = new nlobjSearchColumn('vendorcost');

    /*Parse those values*/
    var M = parseFloat(margin / 100);
    var D = parseFloat(discount / 100);
    var PP = parseFloat(purchaseprice);
    var L = parseFloat(list);
    var P = parseFloat(profit);
    var S = parseFloat(sellingprice);

    //if purchase price is available - we can calculate the rest

    if (itemID != null && itemID != '') {
        if (field == 'margin_item' || field == 'pricing') {

            if (field == 'margin_item') {
                nlapiSetFieldValue('checkbox', 'F');
            }

            //get the price and populate into the PP field
            cost = parseFloat(nlapiLookupField('item', itemID, 'fxcost'));
            nlapiSetFieldValue('purchase_price', cost.toFixed(2), false, false);

            var pricelevel = nlapiGetFieldValue('pricing');
            if (pricelevel == null || pricelevel == '') {
                pricelevel = 1;
            }

            var itemSearch = nlapiSearchRecord("item", null,
                [
                    ["internalidnumber", "equalto", itemID],
                    "AND",
                    ["pricing.pricelevel", "anyof", pricelevel]
                ],
                [
                    new nlobjSearchColumn("itemid"),
                    new nlobjSearchColumn("displayname"),
                    new nlobjSearchColumn("salesdescription"),
                    new nlobjSearchColumn("type"),
                    new nlobjSearchColumn("baseprice"),
                    new nlobjSearchColumn("custitem1"),
                    new nlobjSearchColumn("pricelevel", "pricing"),
                    new nlobjSearchColumn("unitprice", "pricing"),
                    new nlobjSearchColumn("quantityonhand", "inventoryNumberBinOnHand")
                ]
            );

            price = nlapiLookupField('item', itemID, 'custitem_base_price');

            if (itemSearch != null && itemSearch != '') {
                var result = itemSearch[0];
                price = result.getValue("unitprice", "pricing");
                nlapiSetFieldValue('msg_box', '');
            }

            else {
                nlapiSetFieldValue('msg_box', '<p><span style="color: #3366ff;"><strong>Displaying base price - No pricing found at the specified price level.</strong></span></p>');
                //nlapiSetFieldValue('pricing', 1);
            }

            var image;
            var qty;
            var quantity = new Array(4);
            quantity[0] = nlapiLookupField('item', itemID, 'custitem_scansource_qty');
            quantity[1] = nlapiLookupField('item', itemID, 'custitem_jenne_qty');
            quantity[2] = nlapiLookupField('item', itemID, 'custitem_synnexqty');
            quantity[3] = nlapiLookupField('item', itemID, 'custitem_ingram_qty');

            S = parseFloat(price);
            if (S != null || S != '') {
                nlapiSetFieldValue('list', nlapiLookupField('item', itemID, 'custitem_base_price'));
                nlapiSetFieldValue('sell_price', S);
            }

            if (itemID != null) {
                image = nlapiLookupField('item', itemID, 'custitem_image_website');
            }

            if (image == null) {
                nlapiSetFieldValue('custpage_margin_item', "<p> </p>");
            }
            else if (image == "http://www.unifiedcommunications.com/images/product/icon/logo-uc-circle_only.png") {
                nlapiSetFieldValue('custpage_margin_item', "<p></p>");
            }
            else {
                nlapiSetFieldValue('custpage_margin_item', "<img src=" + image + ">");
            }

            for (var i = 0; i < 4; i++) {
                if (i == 0) {
                    qty = 'scansource_qty';
                }
                else if (i == 1) {
                    qty = 'jenne_qty';
                }
                else if (i == 2) {
                    qty = 'synnex_qty';
                }
                else {
                    qty = 'ingram_qty';
                }

                if (quantity[i] == '' || quantity[i] == null) {
                    nlapiSetFieldValue(qty, 0, false);
                }
                else {
                    nlapiSetFieldValue(qty, quantity[i], false);
                }
            }
        }
    }
    else {
        //Blank out everything 
        nlapiSetFieldValue('margin_item', '', false);
        nlapiSetFieldValue('custpage_margin_item', '', false);
        nlapiSetFieldValue('margin', 0, false);
        nlapiSetFieldValue('discount', 0, false);
        nlapiSetFieldValue('purchase_price', 0, false);
        nlapiSetFieldValue('sell_price', 0, false);
        nlapiSetFieldValue('list', 0, false);
        nlapiSetFieldValue('profit', 0, false);
        nlapiSetFieldValue('purchase_price', 0, false);
        nlapiSetFieldValue('scansource_qty', '', false);
        nlapiSetFieldValue('jenne_qty', '', false);
        nlapiSetFieldValue('synnex_qty', 0, false);
        nlapiSetFieldValue('ingram_qty', 0, false);
        nlapiSetFieldValue('pricing', 1, false);
        nlapiSetFieldValue('msg_box', '', false);
    }

    //if field = margin, calculate selling price and the profit
    if (field == 'margin') {
        if (M != 1) {
            S = (-1 * PP) / (M - 1);
            P = S - PP;
            if (L != 0) {
                D = (1 - (S / L)) * 100;
            }

        }
        else {
            alert('Invalid margin value');
        }
        nlapiSetFieldValue('sell_price', S.toFixed(2), false);
        nlapiSetFieldValue('profit', P.toFixed(2), false);
        if (L != 0) {
            if (!isNaN(D)) {
                nlapiSetFieldValue('discount', D.toFixed(2), false, false);
            }
        }
    }

    //if field = purchase price, change selling price and profit (based on the margin)
    if (field == 'purchase_price') {
        if (M != 1) {
            S = (-1 * PP) / (M - 1);
            P = S - PP;
            if (L != 0) {
                D = (1 - (S / L)) * 100;
            }
        }
        else {
            alert('Invalid margin value');
        }
        nlapiSetFieldValue('sell_price', S.toFixed(2), false);
        nlapiSetFieldValue('profit', P.toFixed(2), false);
        if (L != 0) {
            if (!isNaN(D)) {
                nlapiSetFieldValue('discount', D.toFixed(2), false, false);
            }
        }
    }
    //if field = selling price, change the margin and the profit (based on the purchase price)
    if (field == 'sell_price') {
        P = S - PP;
        if (S != 0) {
            M = (P / S) * 100;
        }
        if (L != 0) {
            D = (1 - (S / L)) * 100;
        }
        nlapiSetFieldValue('margin', M.toFixed(2), false);
        nlapiSetFieldValue('profit', P.toFixed(2), false);
        if (L != 0) {
            if (!isNaN(D)) {
                nlapiSetFieldValue('discount', D.toFixed(2), false, false);
            }
        }
    }
    if (field == 'profit') {
        S = P + PP;
        M = (P / S) * 100;
        if (L != 0) {
            D = (1 - (S / L)) * 100;
        }
        nlapiSetFieldValue('sell_price', S.toFixed(2), false);
        nlapiSetFieldValue('margin', M.toFixed(2), false);
        if (L != 0) {
            if (!isNaN(D)) {
                nlapiSetFieldValue('discount', D.toFixed(2), false, false);
            }
        }
    }
    if (field == 'discount') {
        S = L - (D * L);
        if (S != 0) {
            M = (P / S) * 100;
        }
        P = S - PP;
        nlapiSetFieldValue('sell_price', S.toFixed(2), false);
        nlapiSetFieldValue('margin', M.toFixed(2), false);
        nlapiSetFieldValue('profit', P.toFixed(2), false);
    }
}
