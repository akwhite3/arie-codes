/*********
 * UC_SLA_V2 
 * Scheduled Script 
 * 
 * Background: 
 * Used to track the progress of given SLA's 
 * Functionality is typically added on an as needed basis. 
 * This is Version 2 of this script. The original is not currently in use. 
 * This will be the script to update moving forward.
 * This will start as specific and grow to be more general to fit the business needs. 
 * 
 * Script By: Arie White 
 * Created: 2/27/2020
 */

function checkSLAs() {
    nlapiLogExecution('debug','Start');
    var slaColumns = new Array();
    slaColumns[0] = new nlobjSearchColumn('custrecord_sla_item_hours');
    slaColumns[1] = new nlobjSearchColumn('custrecord_sla_item_goal');
    var slaList = nlapiSearchRecord('customrecord_sla_items', null, null, slaColumns);

    if (slaList != null && slaList.length > 0) {
        for (var a = 0; a < slaList.length; a++) {
            var slaItem = slaList[a];

            /*if (slaItem.getId() == 13 || slaItem.getId() == '13') {
                var responseTimeGoal = slaItem.getValue('custrecord_sla_item_hours');
                var expected = slaItem.getValue('custrecord_sla_item_goal');
                rmaProcessTime(responseTimeGoal, expected, slaItem.getId());
            }*/

            if (slaItem.getId() == 14 || slaItem.getId() == '14') {
                var timeGoal = slaItem.getValue('custrecord_sla_item_hours');
                //setTimes();
                getTimeCalcs(timeGoal, 14);
            }
        }
    }
}
function getTimeCalcs(goal, id) {
   

    var timeSearch = nlapiSearchRecord("transaction", null,
        [
            ["custcol_ship_time", "greaterthan", "0"],
            "AND",
            ["trandate", "within", "lastmonth"]
        ],
        [
            new nlobjSearchColumn("tranid"),
            new nlobjSearchColumn("item"),
            new nlobjSearchColumn("custcol_ship_time")
        ]
    );


    //go through the times and see which meet the SLA 
    var met = 0;
    if (timeSearch != null && timeSearch.length > 0) {
        for (var k = 0; k < timeSearch.length; k++) {
            var time = timeSearch[k];
            shipTime = time.getValue("custcol_ship_time");
            if (changeToNum(shipTime) <= changeToNum(goal)) {
                met++;
            }
        }

        var percentage = met / (timeSearch.length) * 100;
        nlapiLogExecution('debug', 'percent met', percentage);
        var slaItem = nlapiLoadRecord('customrecord_sla_items', id);
        slaItem.setFieldValue('custrecord_sla_item_actual', percentage);
        nlapiSubmitRecord(slaItem);
    }

}

function setTimes() {
    //search gives the time the order was relased
    var salesorderSearch = nlapiSearchRecord("salesorder", null,
        [
            ["type", "anyof", "SalesOrd"],
            "AND",
            ["custbody_so_purchase", "anyof", "3", "2"],
            "AND",
            [["systemnotes.field", "anyof", "TRANDOC.KSTATUS"], "AND", ["systemnotes.newvalue", "is", "Pending Fulfillment"], "AND", ["systemnotes.oldvalue", "is", "Pending Approval"]],
            "AND",
            ["status", "anyof", "SalesOrd:F", "SalesOrd:E", "SalesOrd:H", "SalesOrd:G"],
            "AND",
            ["mainline", "is", "T"],
            "AND",
            ["trandate", "within", "lastmonth"]
        ],
        [
            new nlobjSearchColumn("tranid"),
            new nlobjSearchColumn("field", "systemNotes", null),
            new nlobjSearchColumn("oldvalue", "systemNotes", null),
            new nlobjSearchColumn("newvalue", "systemNotes", null),
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("date", "systemNotes").setSort(false) //this is the date/time the status changed 
        ]
    );

    if (salesorderSearch != null && salesorderSearch.length > 0) {

        for (var i = 0; i < salesorderSearch.length; i++) {
            //for each sales order -- 
            var salesOrder = salesorderSearch[i];
            var soReleaseTime = salesOrder.getValue("date", "systemNotes");
            var soID = salesOrder.getValue("internalid");
            var soRecord = nlapiLoadRecord('salesorder', soID);

            //load the sales order - get each item 
            nlapiLogExecution('debug', 'sales lines', soRecord.getLineItemCount('item'));
            for (var j = 0; j < soRecord.getLineItemCount('item'); j++) {
                //if the create po field is blank 
                var createPO = soRecord.getLineItemValue('item', 'createpo', (j + 1));
                if (createPO == '' || createPO == null || createPO == 0 || createPO == '0') {
                    var processTime = soRecord.getLineItemValue('item', 'custcol_ship_time', (j + 1));
                    if (processTime == null || processTime == '') {
                        //search for an item fullfillment with that item and the created from as that sales order 
                        var item = soRecord.getLineItemValue('item', 'item', (j + 1));
                        //if the item fulfillment is found, get the system note showing when the status says shipped
                        var itemfulfillmentSearch = nlapiSearchRecord("itemfulfillment", null,
                            [
                                ["type", "anyof", "ItemShip"],
                                "AND",
                                ["createdfrom.internalidnumber", "equalto", soID],
                                "AND",
                                ["item", "anyof", item],
                                "AND",
                                ["systemnotes.newvalue", "is", "Shipped"]
                            ],
                            [
                                new nlobjSearchColumn("internalid"),
                                new nlobjSearchColumn("date", "systemNotes").setSort("false")
                            ]
                        );

                        //get the time in hours 
                        if (itemfulfillmentSearch != null && itemfulfillmentSearch.length > 0) {
                            var itemFulfillment = itemfulfillmentSearch[0];
                            var timeShipped = itemFulfillment.getValue("date", "systemNotes");
                            nlapiLogExecution('debug', 'timeShipped', timeShipped);
                            var startDate = new Date(soReleaseTime);
                            var endDate = new Date(timeShipped);
                            var elaspedHours = workingHoursBetweenDates(startDate, endDate);
                            soRecord.setLineItemValue('item', 'custcol_ship_time', (j + 1), elaspedHours);
                        }
                    }
                }

                if (nlapiGetContext().getRemainingUsage() < 50) {
                    nlapiLogExecution('debug', 'Yielding script');
                    nlapiYieldScript();
                }
            }

            nlapiSubmitRecord(soRecord, false, true);

            if (nlapiGetContext().getRemainingUsage() < 50) {
                nlapiLogExecution('debug', 'Yielding script');
                nlapiYieldScript();
            }
        }
    }
}

function rmaProcessTime(goal, expectation, id) {
    var goal = changeToNum(goal);
    var rmaSearch = nlapiSearchRecord("customrecord_rma", null,
        [
            ["custrecord_rma_date_received", "isnotempty", ""],
            "AND",
            ["custrecord_rma_date_processed", "isnotempty", ""],
            "AND",
            ["systemnotes.field", "anyof", "CUSTRECORD_RMA_DATE_RECEIVED", "CUSTRECORD_RMA_DATE_PROCESSED"]
        ],
        [
            new nlobjSearchColumn("name").setSort(false),
            new nlobjSearchColumn("field", "systemNotes", null),
            new nlobjSearchColumn("date", "systemNotes", null),
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("custrecord_process_time")
        ]
    );

    if (rmaSearch != null && rmaSearch.length > 0) {
        nlapiLogExecution('debug', 'search results', rmaSearch.length);
        totalRMAs = rmaSearch.length / 2;
        var slaMet = 0;
        var processHours;
        for (var b = 0; b < rmaSearch.length; b = b + 2) {
            var rmaResult = rmaSearch[b];
            var processTime = rmaResult.getValue('custrecord_process_time');

            if (processTime == null || processTime == '') {
                var recieved = rmaResult.getValue("date", "systemNotes", null);

                rmaResult = rmaSearch[b + 1];
                var processed = rmaResult.getValue("date", "systemNotes", null);

                var recievedTS = new Date(recieved);
                var processedTS = new Date(processed);
                r = recievedTS.getTime();
                p = processedTS.getTime();
                processHours = (p - r) / (1000 * 60 * 60);

                var RMA = nlapiLoadRecord('customrecord_rma', rmaResult.getId());
                RMA.setFieldValue('custrecord_process_time', processHours);
                nlapiSubmitRecord(RMA);
            }
            else {
                processHours = changeToNum(processTime);
            }

            if (processHours <= goal) {
                slaMet++;
            }

            if (nlapiGetContext().getRemainingUsage() < 50) {
                nlapiLogExecution('debug', 'Yielding script');
                nlapiYieldScript();
            }
        }
        var percentage = slaMet / totalRMAs * 100;
        var slaItem = nlapiLoadRecord('customrecord_sla_items', slaID);
        slaItem.setFieldValue('custrecord_sla_item_actual', percentage);
        nlapiSubmitRecord(slaItem);

        nlapiLogExecution('debug', 'Results', percentage - changeToNum(expectation));
    }
}

// Simple function that accepts two parameters and calculates
// the number of hours worked within that range
function workingHoursBetweenDates(startDate, endDate) {
    // Store minutes worked
    var minutesWorked = 0;

    // Validate input
    if (endDate < startDate) { return 0; }

    // Loop from your Start to End dates (by hour)
    var current = startDate;

    // Define work range
    var workHoursStart = 8;
    var workHoursEnd = 17;
    var includeWeekends = false;

    // Loop while currentDate is less than end Date (by minutes)
    while (current <= endDate) {
        // Is the current time within a work day (and if it 
        // occurs on a weekend or not)          
        if (current.getHours() >= workHoursStart && current.getHours() < workHoursEnd && (includeWeekends ? current.getDay() !== 0 && current.getDay() !== 6 : true)) {
            minutesWorked++;
        }

        // Increment current time
        current.setTime(current.getTime() + 1000 * 60);
    }

    // Return the number of hours
    return minutesWorked / 60;
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