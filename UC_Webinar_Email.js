/***************************
 * UC Webinar Email Send
 */
function sendWebinar() {
    //Check if the Created By is the Webservice
    var createdBy = nlapiGetFieldValue('custentity_createdby');

    if (createdBy == '113' && nlapiGetFieldValue('custentity_camp_email_sent') == 'F') //Webserivce
    {
        var campaign = nlapiGetFieldValue('leadsource');

        //Webinar - Device-a-thon 3.0 2019 Q1
        if (campaign == '9125') {
            sendDeviceAThon();
        }
        else if (campaign == '97527') {
            sendSurfaceHubCollab();
        }
        else if (campaign == 'somenum') {
            sendSurfaceHubCollab();
        }
    }
}


/**COPY AND CHANGE */
function sendDeviceAThon() {
    var author = '395718'; //Marketing Events
    var recipient = nlapiGetFieldValue('email');
    var subject = '[Registration Confirmation] Device-a-thon: Microsoft Teams Devices Webinar';
    var body = deviceAThonHTML();
    var records = new Object();
    records['entity'] = nlapiGetFieldValue('internalid');
    var replyTo = 'keileraas@unifiedcommunications.com';

    if (recipient != null && recipient != '') {
        try {
            //nlapiSendEmail(author, recipient, subject, body, cc, bcc, records, attachments, notifySenderOnBounce, internalOnly, replyTo)
            nlapiSendEmail(author, recipient, subject, body, null, null, records, null, null, null, replyTo);

            var leadID = nlapiGetFieldValue('id');
            var lead = nlapiLoadRecord('customer', leadID);
            lead.setFieldValue('custentity_camp_email_sent', 'T');
            nlapiSubmitRecord(lead);
        }
        catch (e) {
            nlapiLogExecution('debug', 'failed', 'author=' + author + ' recip=' + recipient + ' subject=' + subject);

            nlapiSendEmail(899, 'ksmith@unifiedcommunications.com; afeinberg@unifiedcommunications.com', 'DeviceAThon Email Send Error', 'Error: ' + e.message + ' for contact ' + nlapiGetFieldValue('entityid'));
        }
    }
}

function reminderEmail() {

    var author = '395718'; //Marketing Events
    var replyTo = 'msossamon@unifiedcommunications.com';

    //saved search to get email list 
    var customerSearch = nlapiSearchRecord("customer", null,
        [
            ["entityid", "doesnotcontain", "megan Sossamon"],
            "AND",
            ["email", "doesnotcontain", "msossamon"],
            "AND",
            ["email", "doesnotcontain", "@unifiedcommunications.com"],
            "AND",
            ["email", "doesnotcontain", "test@"],
            "AND",
            ["email", "doesnotcontain", "suryamohan"],
            "AND",
            ["leadsource", "anyof", "97527"],
            "AND",
            ["email", "doesnotcontain", "@arkadin"],
            "AND",
            ["email", "doesnotcontain", "@avocor"],
            "AND",
            ["email", "doesnotcontain", "@jabra"],
            "AND",
            ["email", "doesnotcontain", "@logitech"],
            "AND",
            ["email", "doesnotcontain", "@microsoft.com"],
            "AND",
            ["email", "doesnotcontain", "@modalitysystems"],
            "AND",
            ["email", "doesnotcontain", "@plantronics"],
            "AND",
            ["email", "doesnotcontain", "@plenom"],
            "AND",
            ["email", "doesnotcontain", "@t2mdev"],
            "AND",
            ["email", "doesnotcontain", "@uclarity"],
            "AND",
            ["email", "doesnotcontain", "@unifysquare"],
            "AND",
            ["email", "doesnotcontain", "@teamventi"],
            "AND",
            ["email", "doesnotcontain", "@poly.com"],
            "AND",
            ["email", "doesnotcontain", "@polycom"],
            "AND",
            ["email", "doesnotcontain", "@sennheiser"],
            "AND",
            ["email", "doesnotcontain", "allen@surya"],
            "AND",
            ["email", "isnot", "smdurvasula@gmail.com"],
            "AND",
            ["email", "doesnotcontain", "allen@bhanu"]
        ],
        [
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("datecreated").setSort(true),
            new nlobjSearchColumn("companyname"),
            new nlobjSearchColumn("firstname", "contact"),
            new nlobjSearchColumn("lastname", "contact", null),
            new nlobjSearchColumn("email"),
            new nlobjSearchColumn("title"),
            new nlobjSearchColumn("leadsource"),
            new nlobjSearchColumn("phone")
        ]
    );

    if (customerSearch != '' && customerSearch != null) {
        nlapiLogExecution('debug', 'debug', 'There were results.');
        for (var i = 0; i < customerSearch.length; i++) {

            var result = customerSearch[i];
            var recipient = result.getValue('email');
            var subject = '';
            var body = ''; //get from Megan
            var records = new Object();
            records['entity'] = result.getValue('internalid');

            var firstName = result.getValue("firstname", "contact");
            nlapiLogExecution('debug', 'debug', customerSearch.length);
            //send the email 
            try {
                //nlapiSendEmail(author, recipient, subject, body, cc, bcc, records, attachments, notifySenderOnBounce, internalOnly, replyTo)

                var context = nlapiGetContext();
                nlapiLogExecution('debug', 'debug', context.getDeploymentId());

                if (context.getDeploymentId() == 'customdeploy1') {
                    //Day before reminder 
                    subject = '[Webinar Reminder] Surface Hub 2S: The Experience starts tomorrow'
                    body = dayBefore();
                }

                else if (context.getDeploymentId() == 'customdeploy2') {
                    //Hour before reminder 
                    body = dayOf(firstName);
                    subject = '“[Webinar Reminder] Surface Hub 2S: The Experience starts soon';
                }

                else if (context.getDeploymentId() == 'customdeploy3') {
                    //After and survey 
                    body = afterWebinar(firstName);
                    subject = 'Webinar recording and Q&A from “Surface Hub 2S: The Experience"';
                }
                else {
                    body = disregardEmail(firstName);
                    subject = 'Please disregard "Surface Hub 2S: The Experience" webinar reminder'
                }


                nlapiSendEmail(author, recipient, subject, body, null, 'awhite@unifiedcommunications.com', records, null, null, null, replyTo);

            }
            catch (e) {
                nlapiLogExecution('debug', 'failed', 'author=' + author + ' recip=' + recipient + ' subject=' + subject);
                nlapiSendEmail(899, 'ksmith@unifiedcommunications.com; afeinberg@unifiedcommunications.com; awhite@unifiedcommunications.com', 'Surface Hub 2S Email Send Error', 'Error: ' + e.message + ' for contact ' + nlapiGetFieldValue('entityid'));
            }
        }
    }

    else {
        nlapiLogExecution('debug', 'debug', 'There were no results.');
        try {
            //nlapiSendEmail(author, recipient, subject, body, cc, bcc, records, attachments, notifySenderOnBounce, internalOnly, replyTo)

            var context = nlapiGetContext();
            nlapiLogExecution('debug', 'debug', context.getDeploymentId());

            if (context.getDeploymentId() == 'customdeploy1') {
                //Day before reminder 
                subject = '[Webinar Reminder] Surface Hub 2S: The Experience starts tomorrow'
                body = dayBefore();
            }

            else if (context.getDeploymentId() == 'customdeploy2') {
                //Hour before reminder 
                subject = '“[Webinar Reminder] Surface Hub 2S: The Experience starts soon';
                body = dayOf(firstName);
            }

            else if (context.getDeploymentId() == 'customdeploy3') {
                //After and survey 
                subject = 'Webinar recording and Q&A from “Surface Hub 2S: The Experience"';
                body = afterWebinar(firstName);
            }
            else {
                body = disregardEmail(firstName);
                subject = 'Please disregard "Surface Hub 2S: The Experience" webinar reminder'
            }

            var recipient = 'awhite@unifiedcommunications.com';
            nlapiSendEmail(author, recipient, subject, body, null, null, null, null, null, null, replyTo);

        }
        catch (e) {
            nlapiLogExecution('debug', 'failed', 'author=' + author + ' recip=' + recipient + ' subject=' + subject);
            nlapiSendEmail(899, 'ksmith@unifiedcommunications.com; afeinberg@unifiedcommunications.com; awhite@unifiedcommunications.com', 'Surface Hub 2S Email Send Error', 'Error: ' + e.message + ' for contact ' + nlapiGetFieldValue('entityid'));
        }
    }
}

function sendSurfaceHubCollab() {
    var author = '395718'; //Marketing Events
    var recipient = nlapiGetFieldValue('email');
    var subject = '[Registration Confirmation] Surface Hub 2S: The Experience Webinar';
    //CHANGE THE BODY FUNCTION
    var body = surfaceHubHTML();
    var records = new Object();
    records['entity'] = nlapiGetFieldValue('internalid');
    var replyTo = 'keileraas@unifiedcommunications.com';

    if (recipient != null && recipient != '') {
        try {
            //nlapiSendEmail(author, recipient, subject, body, cc, bcc, records, attachments, notifySenderOnBounce, internalOnly, replyTo)
            nlapiSendEmail(author, recipient, subject, body, null, null, records, null, null, null, replyTo);

            var leadID = nlapiGetFieldValue('id');
            var lead = nlapiLoadRecord('customer', leadID);
            lead.setFieldValue('custentity_camp_email_sent', 'T');
            nlapiSubmitRecord(lead);
        }
        catch (e) {
            nlapiLogExecution('debug', 'failed', 'author=' + author + ' recip=' + recipient + ' subject=' + subject);

            /**ADD MYSELF ON CC */
            nlapiSendEmail(899, 'ksmith@unifiedcommunications.com; afeinberg@unifiedcommunications.com; awhite@unifiedcommunications.com', 'Surface Hub 2S Email Send Error', 'Error: ' + e.message + ' for contact ' + nlapiGetFieldValue('entityid'));
        }
    }
}

/**COPY AND RENAME THIS FUNCTION BELOW TO FIT  */

function deviceAThonHTML() {
    body = '';

    body += '<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%; border-collapse: collapse;" data-ogsb="rgb(232, 234, 234)">';
    body += '<tbody>';
    body += '<tr>';
    body += '<td valign="top" style="padding:2.25pt 2.25pt 2.25pt 2.25pt">';
    body += '	<div align="center">';
    body += '		<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width:6.25in; border-collapse:collapse">';
    body += '			<tbody>';
    body += '			    <tr>';
    body += '					<td valign="top" style="padding:0in 0in 0in 0in">';
    body += '						<div align="center">';
    body += '							<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '								<tbody>';
    body += '									<tr>';
    body += '										<td width="161" style="width:120.75pt; padding:15.0pt 0in 11.25pt 7.5pt">';
    body += '											<p class="x_x_MsoNormal">';
    body += '												<a href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="Visit UnifiedCommunications.com" id="LPlnk129286" class="x_OWAAutoLink" data-ogsc="" style="color: rgb(66, 66, 66);">';
    body += '                                               	<span style="text-decoration:none">';
    body += '														<img data-imagetype="External" src="https://www.unifiedcommunications.com/skins/Skin_1/img/logo.png" border="" width="161" id="x_x__x0000_i1025" alt="UnifiedCommunications Logo" style="width:3in; display: block; margin-left: auto; margin-right: auto">';
    body += '                                               	</span>';
    body += '												</a>';
    body += '											</p>';
    body += '										</td>';
    body += '									</tr>';
    body += '								</tbody>';
    body += '							</table>';
    body += '						</div>';
    body += '						<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '							<span style="display:none">&nbsp;</span>';
    body += '						</p>';
    body += '						<div align="center">';
    body += '							<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%; border-collapse: collapse; border-spacing: 0px;" data-ogsb="white">';
    body += '								<tbody>';
    body += '									<tr style="height:5.5pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:5.5pt"></td>';
    body += '									</tr>';
    body += '									<tr>';
    body += '										<td valign="top" style="padding:0in 0in 0in 0in">';
    body += '											<p class="x_x_topsub" align="center" style="margin:0in; margin-bottom:.0001pt; text-align:center; line-height:9.0pt">';
    body += '												<span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color:#366ab3; letter-spacing: 0.75pt;">REGISTRATION CONFIRMATION</span>';
    body += '											</p>';
    body += '										</td>';
    body += '									</tr>';
    body += '									<tr style="height:16.5pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:16.5pt"></td>';
    body += '									</tr>';
    body += '									<tr>';
    body += '										<td style="padding:0in 0in 0in 0in">';
    body += '											<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '												<tbody>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<p class="x_x_topheader" align="center" style="margin:0in; margin-bottom:.0001pt; text-align:center; line-height:30.0pt">';
    body += '																<b><span style="font-size: 24pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(51, 51, 51)">Thank You for Registering for the Webinar';
    body += '																</span></b>';
    body += '															</p>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:9.0pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:9.0pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<p class="x_x_bodycopy" align="center" style="margin:0in; margin-bottom:.0001pt; text-align:center; line-height:18.0pt">';
    body += '																<span style="font-size: 12pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(77, 77, 77)">';
    body += '																We look forward to having you with us!';
    body += '																</span>';
    body += '															</p>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:30.0pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:30.0pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<div align="center">';
    body += '																<table class="x_x_MsoNormalTable" border="1" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse; border:none; border-spacing:0">';
    body += '																	<tbody>';
    body += '																		<tr>';
    body += '																			<td width="35" style="width: 26.25pt; border: 1pt inset rgb(222, 225, 225); background:rgb(204, 204, 204); padding: 0in;" data-ogsb="rgb(222, 225, 225)">';
    body += '																				<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '																					<img data-imagetype="External" src="https://d1j8pt39hxlh3d.cloudfront.net/emoji/emojione/3.0/png/128/2714.png" originalsrc="https://d1j8pt39hxlh3d.cloudfront.net/emoji/emojione/3.0/png/128/2714.png" data-connectorsauthtoken="1" data-imageproxyendpoint="/actions/ei" data-imageproxyid="" border="0" width="22" id="x_x__x0000_i1027" style="width:0.2291in">';
    body += '																				</p>';
    body += '																			</td>';
    body += '																			<td style="border:inset #DEE1E1 1.0pt; border-left:none; padding:0in 0in 0in 0in">';
    body += '																				<div align="center">';
    body += '																					<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '																						<tbody>';
    body += '																							<tr style="height:24.0pt">';
    body += '																								<td colspan="3" style="padding:0in 0in 0in 0in; height:24.0pt"></td>';
    body += '																							</tr>';
    body += '																							<tr>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																								<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '																									<p class="x_x_subheadstyle" style="margin:0in; margin-bottom:.0001pt; line-height:21.0pt">';
    body += '																										<b>';
    body += '																										<span style="font-size: 15pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(51, 51, 51)">UC Device-a-thon: Microsoft Teams Devices';
    body += '																										</span>';
    body += '																										</b>';
    body += '																									</p>';
    body += '																								</td>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																							</tr>';
    body += '																							<tr style="height:7.5pt">';
    body += '																								<td colspan="3" style="padding:0in 0in 0in 0in; height:7.5pt"></td>';
    body += '																							</tr>';
    body += '																							<tr>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																								<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '																									<p class="x_x_bodycopy" style="margin:0in; margin-bottom:.0001pt; line-height:18.0pt">';
    body += '																										<span style="font-size: 12pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(77, 77, 77)">March 13, 2019 12:00 - 1:00 PM CT';
    body += '																										</span>';
    body += '																									</p>';
    body += '																								</td>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																							</tr>';
    body += '																							<tr style="height:22.5pt">';
    body += '																								<td colspan="3" style="padding:0in 0in 0in 0in; height:22.5pt"></td>';
    body += '																							</tr>';
    body += '																							<tr>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																								<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px">';
    body += '																									<div align="center">';
    body += '																										<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '																											<tbody>';
    body += '																												<tr>';
    body += '																													<td style="padding:0in 0in 0in 0in; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px">';
    body += '																														<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">';
    body += '																															<tbody>';
    body += '																																<tr style="height:27.0pt">';
    body += '																																	<td width="120" style="width: 1.25in; border: 1.5pt solid #366ab3; padding: 0in; height: 27pt;" data-ogsb="white">';
    body += '																																		<div>';
    body += '																																			<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '																																				<a href="https://www.unifiedcommunications.com/documents/doc/TeamsWebinar.ics" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="Add to Calendar" id="LPlnk681537" class="x_OWAAutoLink" data-ogsc="" style="color: rgb(228, 159, 255);">';
    body += '																																				<b>';
    body += '																																				<span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63); text-decoration: none;">Add to Calendar</span>';
    body += '																																				</b>';
    body += '																																				<b>';
    body += '																																				<span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-decoration: none;"></span>';
    body += '																																				</b>';
    body += '																																				</a>';
    body += '																																			</p>';
    body += '																																		</div>';
    body += '																																	</td>';
    body += '																																</tr>';
    body += '																															</tbody>';
    body += '																														</table>';
    body += '																													</td>';
    body += '																												</tr>';
    body += '																											</tbody>';
    body += '																										</table>';
    body += '																									</div>';
    body += '																								</td>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																							</tr>';
    body += '																							<tr style="height: 30.0pt;">';
    body += '																								<td style="padding: 0in 0in 0in 0in; height: 30.0pt;" colspan="3">';
    body += '																									<p class="x_x_infooter1" style="text-align: left;" align="left">';
    body += '																										<span style="font-size: 8.5pt; padding-left:8%">';
    body += '																											<em>';
    body += '																												<span style="font-family: Helvetica, sans-serif, serif, EmojiFont; color: #366ab3;" data-ogsc="rgb(153, 153, 153)">*Please allow for pop-ups for the calendar invitation to download.</span>';
    body += '																											</em>';
    body += '																										</span>';
    body += '																									</p>';
    body += '																								</td>';
    body += '																							</tr>';
    body += '																						</tbody>';
    body += '																					</table>';
    body += '																				</div>';
    body += '																			</td>';
    body += '																		</tr>';
    body += '																	</tbody>';
    body += '																</table>';
    body += '															</div>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:31.5pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:31.5pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<p class="x_x_bodycopy" style="margin:0in; margin-bottom:.0001pt; line-height:18.0pt">';
    body += '																<span style="font-size: 11.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(77, 77, 77)">Hang on to this email. You can click the button below to join when the webinar begins.';
    body += '																<b>We\'ll send you a reminder 1 hour before showtime and a recording of your webinar afterward</b>.';
    body += '																</span>';
    body += '															</p>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:31.5pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:31.5pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px">';
    body += '															<div align="center">';
    body += '																<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">';
    body += '																	<tbody>';
    body += '																		<tr style="height:30.0pt">';
    body += '																			<td width="260" style="width: 195pt; background:#366ab3; padding: 0in; height: 30pt;" data-ogsb="rgb(89, 203, 89)">';
    body += '																				<div>';
    body += '																					<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '																						<span style="color:white">';
    body += '																							<a href="http://bit.ly/2BVFJVY" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="Join The Webinar" id="LPlnk646404" class="x_OWAAutoLink" data-ogsc="" style="color: rgb(228, 159, 255);">';
    body += '																								<span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: white; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;">Join The Webinar</span>';
    body += '																								<span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;"></span>';
    body += '																							</a>';
    body += '																						</span>';
    body += '																					</p>';
    body += '																				</div>';
    body += '																			</td>';
    body += '																		</tr>';
    body += '																	</tbody>';
    body += '																</table>';
    body += '															</div>';
    body += '														</td>';
    body += '													</tr>';
    body += '												</tbody>';
    body += '											</table>';
    body += '										</td>';
    body += '									</tr>';
    body += '									<tr style="height:30.0pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:30.0pt"></td>';
    body += '									</tr>';
    body += '								</tbody>';
    body += '							</table>';
    body += '						</div>';
    body += '						<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '							<span style="display:none">&nbsp;</span>';
    body += '						</p>';
    body += '						<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '							<span style="display:none">&nbsp;</span>';
    body += '						</p>';
    body += '						<div align="center">';
    body += '							<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '								<tbody>';
    body += '									<tr style="height:15.0pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:15.0pt"></td>';
    body += '									</tr>';
    body += '									<tr>';
    body += '										<td valign="top" style="padding:0in 0in 0in 0in">';
    body += '											<p class="x_x_infooter1" align="center" style="text-align:center">';
    body += '												<span style="font-size: 8.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(195, 195, 195);" data-ogsc="rgb(153, 153, 153)">';
    body += '													<a href="https://www.google.com/maps/place/2075+E+Governors+Cir,+Houston,+TX+77092/@29.806549,-95.448371" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="View Map" id="LPlnk479088" class="x_OWAAutoLink" data-ogsc="" style="color: rgb(228, 159, 255);">';
    body += '														<span style="color: rgb(63, 63, 63); text-decoration: none;" data-ogsc="rgb(153, 153, 153)">UnifiedCommunications.com, 2075 East Governors Circle, Houston, TX 77092 </span>';
    body += '													</a>';
    body += '												</span>';
    body += '											</p>';
    body += '										</td>';
    body += '									</tr>';
    body += '								</tbody>';
    body += '							</table>';
    body += '						</div>';
    body += '					</td>';
    body += '				</tr>';
    body += '				<tr style="height:75.0pt">';
    body += '					<td style="padding:0in 0in 0in 0in; height:75.0pt"></td>';
    body += '				</tr>';
    body += '			</tbody>';
    body += '		</table>';
    body += '	</div>';
    body += '</td>';
    body += '</tr>';
    body += '</tbody>';
    body += '</table>';

    return body;
}

function surfaceHubHTML() {
    body = '';

    body += '<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%; border-collapse: collapse;" data-ogsb="rgb(232, 234, 234)">';
    body += '<tbody>';
    body += '<tr>';
    body += '<td valign="top" style="padding:2.25pt 2.25pt 2.25pt 2.25pt">';
    body += '	<div align="center">';
    body += '		<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="600" style="width:6.25in; border-collapse:collapse">';
    body += '			<tbody>';
    body += '				<tr>';
    body += '					<td valign="top" style="padding:0in 0in 0in 0in">';
    body += '						<div align="center">';
    body += '							<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '								<tbody>';
    body += '									<tr>';
    body += '										<td width="161" style="width:120.75pt; padding:15.0pt 0in 11.25pt 7.5pt">';
    body += '											<p class="x_x_MsoNormal">';
    body += '												<a href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="Visit UnifiedCommunications.com" id="LPlnk129286" class="x_OWAAutoLink" data-ogsc="" style="color: rgb(66, 66, 66);">';
    body += '                                               	<span style="text-decoration:none">';
    body += '														<img data-imagetype="External" src="https://www.unifiedcommunications.com/skins/Skin_1/img/logo.png" border="" width="161" id="x_x__x0000_i1025" alt="UnifiedCommunications Logo" style="width:3in; display: block; margin-left: auto; margin-right: auto">';
    body += '                                               	</span>';
    body += '												</a>';
    body += '											</p>';
    body += '										</td>';
    body += '									</tr>';
    body += '								</tbody>';
    body += '							</table>';
    body += '						</div>';
    body += '						<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '							<span style="display:none">&nbsp;</span>';
    body += '						</p>';
    body += '						<div align="center">';
    body += '							<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%; border-collapse: collapse; border-spacing: 0px;" data-ogsb="white">';
    body += '								<tbody>';
    body += '									<tr style="height:5.5pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:5.5pt"></td>';
    body += '									</tr>';
    body += '									<tr>';
    body += '										<td valign="top" style="padding:0in 0in 0in 0in">';
    body += '											<p class="x_x_topsub" align="center" style="margin:0in; margin-bottom:.0001pt; text-align:center; line-height:9.0pt">';
    body += '												<span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color:#366ab3; letter-spacing: 0.75pt;">REGISTRATION CONFIRMATION</span>';
    body += '											</p>';
    body += '										</td>';
    body += '									</tr>';
    body += '									<tr style="height:16.5pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:16.5pt"></td>';
    body += '									</tr>';
    body += '									<tr>';
    body += '										<td style="padding:0in 0in 0in 0in">';
    body += '											<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '												<tbody>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<p class="x_x_topheader" align="center" style="margin:0in; margin-bottom:.0001pt; text-align:center; line-height:30.0pt">';
    body += '																<b><span style="font-size: 24pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(51, 51, 51)">Thank You for Registering for the Webinar';
    body += '																</span></b>';
    body += '															</p>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:9.0pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:9.0pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<p class="x_x_bodycopy" align="center" style="margin:0in; margin-bottom:.0001pt; text-align:center; line-height:18.0pt">';
    body += '																<span style="font-size: 12pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(77, 77, 77)">';
    body += '																We look forward to having you with us!';
    body += '																</span>';
    body += '															</p>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:30.0pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:30.0pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<div align="center">';
    body += '																<table class="x_x_MsoNormalTable" border="1" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse; border:none; border-spacing:0">';
    body += '																	<tbody>';
    body += '																		<tr>';
    body += '																			<td width="35" style="width: 26.25pt; border: 1pt inset rgb(222, 225, 225); background:rgb(204, 204, 204); padding: 0in;" data-ogsb="rgb(222, 225, 225)">';
    body += '																				<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '																					<img data-imagetype="External" src="https://d1j8pt39hxlh3d.cloudfront.net/emoji/emojione/3.0/png/128/2714.png" originalsrc="https://d1j8pt39hxlh3d.cloudfront.net/emoji/emojione/3.0/png/128/2714.png" data-connectorsauthtoken="1" data-imageproxyendpoint="/actions/ei" data-imageproxyid="" border="0" width="22" id="x_x__x0000_i1027" style="width:0.2291in">';
    body += '																				</p>';
    body += '																			</td>';
    body += '																			<td style="border:inset #DEE1E1 1.0pt; border-left:none; padding:0in 0in 0in 0in">';
    body += '																				<div align="center">';
    body += '																					<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '																						<tbody>';
    body += '																							<tr style="height:24.0pt">';
    body += '																								<td colspan="3" style="padding:0in 0in 0in 0in; height:24.0pt"></td>';
    body += '																							</tr>';
    body += '																							<tr>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																								<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '																									<p class="x_x_subheadstyle" style="margin:0in; margin-bottom:.0001pt; line-height:21.0pt">';
    body += '																										<b>';
    body += '																										<span style="font-size: 15pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(51, 51, 51)">Surface Hub 2S: The Experience';
    body += '																										</span>';
    body += '																										</b>';
    body += '																									</p>';
    body += '																								</td>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																							</tr>';
    body += '																							<tr style="height:7.5pt">';
    body += '																								<td colspan="3" style="padding:0in 0in 0in 0in; height:7.5pt"></td>';
    body += '																							</tr>';
    body += '																							<tr>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																								<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '																									<p class="x_x_bodycopy" style="margin:0in; margin-bottom:.0001pt; line-height:18.0pt">';
    body += '																										<span style="font-size: 12pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(77, 77, 77)"><b>September 17, 2019</b><br> 12:00 - 12:45 PM CT';
    body += '																										</span>';
    body += '																									</p>';
    body += '																								</td>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																							</tr>';
    body += '																							<tr style="height:22.5pt">';
    body += '																								<td colspan="3" style="padding:0in 0in 0in 0in; height:22.5pt"></td>';
    body += '																							</tr>';
    body += '																							<tr>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																								<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px">';
    body += '																									<div align="center">';
    body += '																										<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '																											<tbody>';
    body += '																												<tr>';
    body += '																													<td style="padding:0in 0in 0in 0in; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px">';
    body += '																														<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">';
    body += '																															<tbody>';
    body += '																																<tr style="height:27.0pt">';
    body += '																																	<td width="120" style="width: 1.25in; border: 1.5pt solid #366ab3; padding: 0in; height: 27pt;" data-ogsb="white">';
    body += '																																		<div>';
    body += '																																			<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '																																				<a href="http://unifiedcommunications.com/documents/doc/SurfaceHub2STheExperienceWebinarByUnifiedCommunications.ics" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="Add to Calendar" id="LPlnk681537" class="x_OWAAutoLink" data-ogsc="" style="color: white">';
    body += '																																				<b>';
    body += '																																				<span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63); text-decoration: none;">Add to Calendar</span>';
    body += '																																				</b>';
    body += '																																				<b>';
    body += '																																				<span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-decoration: none;"></span>';
    body += '																																				</b>';
    body += '																																				</a>';
    body += '																																			</p>';
    body += '																																		</div>';
    body += '																																	</td>';
    body += '																																</tr>';
    body += '																															</tbody>';
    body += '																														</table>';
    body += '																													</td>';
    body += '																												</tr>';
    body += '																											</tbody>';
    body += '																										</table>';
    body += '																									</div>';
    body += '																								</td>';
    body += '																								<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '																							</tr>';
    body += '																							<tr style="height: 30.0pt;">';
    body += '																								<td style="padding: 0in 0in 0in 0in; height: 30.0pt;" colspan="3">';
    body += '																									<p class="x_x_infooter1" style="text-align: left;" align="left">';
    body += '																										<span style="font-size: 8.5pt; padding-left:8%">';
    body += '																											<em>';
    body += '																												<span style="font-family: Helvetica, sans-serif, serif, EmojiFont; color: #366ab3;" data-ogsc="rgb(153, 153, 153)">*Please allow for pop-ups for the calendar invitation to download.</span>';
    body += '																											</em>';
    body += '																										</span>';
    body += '																									</p>';
    body += '																								</td>';
    body += '																							</tr>';
    body += '																						</tbody>';
    body += '																					</table>';
    body += '																				</div>';
    body += '																			</td>';
    body += '																		</tr>';
    body += '																	</tbody>';
    body += '																</table>';
    body += '															</div>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:31.5pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:31.5pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in">';
    body += '															<p class="x_x_bodycopy" style="margin:0in; margin-bottom:.0001pt; line-height:18.0pt">';
    body += '																<span style="font-size: 11.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(63, 63, 63);" data-ogsc="rgb(77, 77, 77)">Hang on to this email. You can click the button below to join when the webinar begins.';
    body += '																<b>We\'ll send you a reminder 1 hour before showtime and a recording of your webinar afterward</b>.';
    body += '																</span>';
    body += '															</p>';
    body += '														</td>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '													</tr>';
    body += '													<tr style="height:31.5pt">';
    body += '														<td colspan="3" style="padding:0in 0in 0in 0in; height:31.5pt"></td>';
    body += '													</tr>';
    body += '													<tr>';
    body += '														<td width="8%" style="width:8.0%; padding:0in 0in 0in 0in"></td>';
    body += '														<td width="84%" valign="top" style="width:84.0%; padding:0in 0in 0in 0in; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px">';
    body += '															<div align="center">';
    body += '																<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse">';
    body += '																	<tbody>';
    body += '																		<tr style="height:30.0pt">';
    body += '																			<td width="260" style="width: 195pt; background:#366ab3; padding: 0in; height: 30pt;" data-ogsb="rgb(89, 203, 89)">';
    body += '																				<div>';
    body += '																					<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '																						<span style="color:white">';
    body += '																							<a href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_NDJmZDk0MWQtZGY0Ny00MTcwLTk1YjUtNzEyNmY2ODMyZDVk%40thread.v2/0?context=%7b%22Tid%22%3a%2291d501ab-004e-444d-93e8-f7e8fbd65bfb%22%2c%22Oid%22%3a%22e69a2426-6c58-467e-8b40-a6a0faefb2f0%22%2c%22IsBroadcastMeeting%22%3atrue%7d" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="Join The Webinar" id="LPlnk646404" class="x_OWAAutoLink" data-ogsc="" style="color: white;">';
    body += '																								<span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: white; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;">Join The Webinar</span>';
    body += '																								<span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;"></span>';
    body += '																							</a>';
    body += '																						</span>';
    body += '																					</p>';
    body += '																				</div>';
    body += '																			</td>';
    body += '																		</tr>';
    body += '																	</tbody>';
    body += '																</table>';
    body += '															</div>';
    body += '														</td>';
    body += '													</tr>';
    body += '												</tbody>';
    body += '											</table>';
    body += '										</td>';
    body += '									</tr>';
    body += '									<tr style="height:30.0pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:30.0pt"></td>';
    body += '									</tr>';
    body += '								</tbody>';
    body += '							</table>';
    body += '						</div>';
    body += '						<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '							<span style="display:none">&nbsp;</span>';
    body += '						</p>';
    body += '						<p class="x_x_MsoNormal" align="center" style="text-align:center">';
    body += '							<span style="display:none">&nbsp;</span>';
    body += '						</p>';
    body += '						<div align="center">';
    body += '							<table class="x_x_MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%; border-collapse:collapse">';
    body += '								<tbody>';
    body += '									<tr style="height:15.0pt">';
    body += '										<td style="padding:0in 0in 0in 0in; height:15.0pt"></td>';
    body += '									</tr>';
    body += '									<tr>';
    body += '										<td valign="top" style="padding:0in 0in 0in 0in">';
    body += '											<p class="x_x_infooter1" align="center" style="text-align:center">';
    body += '												<span style="font-size: 8.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: rgb(195, 195, 195);" data-ogsc="rgb(153, 153, 153)">';
    body += '													<a href="https://www.google.com/maps/place/2075+E+Governors+Cir,+Houston,+TX+77092/@29.806549,-95.448371" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" title="View Map" id="LPlnk479088" class="x_OWAAutoLink" data-ogsc="" style="color:#366ab3;">';
    body += '														<span style="color: rgb(63, 63, 63); text-decoration: none;" data-ogsc="rgb(153, 153, 153)">UnifiedCommunications.com, 2075 East Governors Circle, Houston, TX 77092 </span>';
    body += '													</a>';
    body += '												</span>';
    body += '											</p>';
    body += '										</td>';
    body += '									</tr>';
    body += '								</tbody>';
    body += '							</table>';
    body += '						</div>';
    body += '					</td>';
    body += '				</tr>';
    body += '				<tr style="height:75.0pt">';
    body += '					<td style="padding:0in 0in 0in 0in; height:75.0pt"></td>';
    body += '				</tr>';
    body += '			</tbody>';
    body += '		</table>';
    body += '	</div>';
    body += '</td>';
    body += '</tr>';
    body += '</tbody>';
    body += '</table>';

    return body;
}

function dayOf(firstName) {
    body = '';
    body += '<div align="center">';
    body += '   <table class="x_x_MsoNormalTable" style="width: 6.25in; border-collapse: collapse;" border="0" width="600" cellspacing="0" cellpadding="0">';
    body += '       <tbody>';
    body += '           <tr>';
    body += '               <td style="padding: 0in 0in 0in 0in;" valign="top"><br />';
    body += '                   <div align="center">';
    body += '                       <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '                           <tbody>';
    body += '                                <tr>';
    body += '                                   <td style="width: 120.75pt; padding: 15.0pt 0in 11.25pt 7.5pt;" width="161">';
    body += '                                       <p align="center" class="x_x_MsoNormal"><a id="LPlnk129286" class="x_OWAAutoLink" style="color: #424242;" title="Visit UnifiedCommunications.com" href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="text-decoration: none;"><img align="middle" id="x_x__x0000_i1025" style="width: 3in; display: block; margin-left: auto; margin-right: auto;" src="https://www.unifiedcommunications.com/skins/Skin_1/img/logo.png" alt="UnifiedCommunications Logo" width="161" border="" data-imagetype="External" /> </span> </a></p>';
    body += '                                   </td>';
    body += '                               </tr>';
    body += '                           </tbody>';
    body += '                       </table>';
    body += '                       <table class="x_x_MsoNormalTable" style="width: 100%; border-collapse: collapse; border-spacing: 0px;" border="0" width="100%" cellspacing="0" cellpadding="0" data-ogsb="white">';
    body += '                           <tbody>';
    body += '                               <tr style="height: 5.5pt;">';
    body += '                                   <td style="padding: 0in 0in 0in 0in; height: 5.5pt;">&nbsp;</td>';
    body += '                               </tr>';
    body += '                               <tr style="height: 16.5pt;">';
    body += '                                   <td style="padding: 0in 0in 0in 0in; height: 16.5pt;">&nbsp;</td>';
    body += '                               </tr>';
    body += '                               <tr>';
    body += '                                   <td style="padding: 0in 0in 0in 0in;"><br />';
    body += '                                       <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '                                           <tbody>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84.0%; padding: 0in 0in 0in 0in;" valign="top" width="84%"><br />';
    body += '                                                       <p class="x_x_topheader" style="margin: 0in; margin-bottom: .0001pt; text-align: center; line-height: 21.0pt;" align="center"><strong><span style="font-size: 21pt; font-family: Helvetica, sans-serif, serif, EmojiFont;" data-ogsc="rgb(51, 51, 51)">The "Surface Hub 2S: The Experience" webinar starts soon!</span></strong></p>';
    body += '                                                   </td>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 9.0pt;">';
    body += '                                                   <td style="padding: 0in 0in 0in 0in; height: 9.0pt;" colspan="3">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84.0%; padding: 0in 0in 0in 0in;" valign="top" width="84%">';
    body += '                                                       <p class="x_x_bodycopy" style="margin: 0in; margin-bottom: .0001pt; line-height: 13.0pt;"><span style="font-size: 8.8pt; font-family: Helvetica, sans-serif, serif, EmojiFont;" data-ogsc="rgb(77, 77, 77)"><br>Hi ' + firstName + ', <br /><br />You\'ve registered for today\'s webinar, <strong>Surface Hub 2S: The Experience</strong>.<br /><br /> The webinar will begin shortly at 10:00 PT / 10:00 MT / 12:00 CT / 1:00 ET.</span></p>';
    body += '                                                   </td>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 30.0pt;">';
    body += '                                                   <td style="padding: 0in 0in 0in 0in; height: 30.0pt;" colspan="3">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84.0%; padding: 0in 0in 0in 0in;" valign="top" width="84%"><br />';
    body += '                                                       <div align="center">';
    body += '                                                           <table class="x_x_MsoNormalTable" style="border-collapse: collapse;" border="0" cellspacing="0" cellpadding="0">';
    body += '                                                               <tbody>';
    body += '                                                                   <tr style="height: 30.0pt;">';
    body += '                                                                       <td style="width: 135pt; background: #366ab3; padding: 0in; height: 30pt;" width="260" data-ogsb="rgb(89, 203, 89)">';
    body += '                                                                           <div align="center">';
    body += '                                                                               <p class="x_x_MsoNormal" align="center"><span style="color: white;"><a id="LPlnk646404" class="x_OWAAutoLink" style="color: #366ab3;" title="Join The Webinar" href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_NDJmZDk0MWQtZGY0Ny00MTcwLTk1YjUtNzEyNmY2ODMyZDVk%40thread.v2/0?context=%7b%22Tid%22%3a%2291d501ab-004e-444d-93e8-f7e8fbd65bfb%22%2c%22Oid%22%3a%22e69a2426-6c58-467e-8b40-a6a0faefb2f0%22%2c%22IsBroadcastMeeting%22%3atrue%7d" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: white; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;">Join Webinar</span></a></span></p>';
    body += '                                                                           </div>';
    body += '                                                                       </td>';
    body += '                                                                   </tr>';
    body += '                                                               </tbody>';
    body += '                                                           </table>';
    body += '                                                       </div>';
    body += '                                                       <span style="font-size: 9pt; font-family: Helvetica, sans-serif, serif, EmojiFont;"><br><br>See you there!<br /><br />UnifiedCommunications.com Team</span></td>';
    body += '                                               </tr>';
    body += '                                           </tbody>';
    body += '                                       </table>';
    body += '                                   </td>';
    body += '                               </tr>';
    body += '                               <tr style="height: 30.0pt;">';
    body += '                                   <td>&nbsp;</td>';
    body += '                                   <td style="padding: 0in 0in 0in 0in; height: 30.0pt;">&nbsp;</td>';
    body += '                               </tr>';
    body += '                           </tbody>';
    body += '                       </table>';
    body += '                   </div>';
    body += '               </td>';
    body += '           </tr>';
    body += '       </tbody>';
    body += '   </table>';
    body += '   <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '        <tbody>';
    body += '           <tr>';
    body += '               <td style="padding: 0in 0in 0in 0in;" valign="top">';
    body += '                   <p class="x_x_infooter1" style="text-align: center;" align="center"><span style="font-size: 8.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: #c3c3c3;" data-ogsc="rgb(153, 153, 153)"><a class="x_OWAAutoLink" style="color: #e49fff;" title="View Map" href="https://www.google.com/maps/place/2075+E+Governors+Cir,+Houston,+TX+77092/@29.806549,-95.448371" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="color: #3f3f3f; text-decoration: none;" data-ogsc="rgb(153, 153, 153)">UnifiedCommunications.com, 2075 East Governors Circle, Houston, TX 77092</span></a></span></p>';
    body += '               </td>';
    body += '           </tr>';
    body += '       </tbody>';
    body += '   </table>';
    body += '</div>';

    return body;
}

function dayBefore() {
    var body = '';
    body += '<div align="center"><br />';
    body += '   <table class="x_x_MsoNormalTable" style="width: 6.25in; border-collapse: collapse;" border="0" width="600" cellspacing="0" cellpadding="0">';
    body += '       <tbody>';
    body += '           <tr>';
    body += '               <td style="padding: 0in 0in 0in 0in;" valign="top"><br />';
    body += '                   <div align="center">';
    body += '                       <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse; border-color: white;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '                           <tbody>';
    body += '                               <tr>';
    body += '                                   <td style="width: 120.75pt; padding: 15pt 0in 11.25pt 7.5pt; text-align: center; vertical-align: middle;" width="161"><br />';
    body += '                                       <p class="x_x_MsoNormal" align="center"><a class="x_OWAAutoLink" style="color: #424242;" title="Visit UnifiedCommunications.com" href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""> <span style="text-decoration: none;"> <img id="x_x__x0000_i1025" style="width: 3in; display: block; margin-left: auto; margin-right: auto;" src="https://www.unifiedcommunications.com/skins/Skin_1/img/logo.png" alt="UnifiedCommunications Logo" width="161" align="middle" border="" data-imagetype="External" /></span></a><a id="LPlnk129286" class="x_OWAAutoLink" style="color: #424242;" title="Visit UnifiedCommunications.com" href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""></a></p>';
    body += '                                   </td>';
    body += '                               </tr>';
    body += '                           </tbody>';
    body += '                       </table>';
    body += '                       <br />';
    body += '                       <table class="x_x_MsoNormalTable" style="width: 100%; border-collapse: collapse; border-spacing: 0px; border-color: white;" border="0" width="100%" cellspacing="0" cellpadding="0" data-ogsb="white">';
    body += '                           <tbody>';
    body += '                               <tr>';
    body += '                                   <td style="padding: 0in 0in 0in 0in;"><br />';
    body += '                                       <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse; border-color: white;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '                                           <tbody>';
    body += '                                               <tr style="height: 82px;">';
    body += '                                                   <td style="width: 8%; padding: 0in; height: 82px;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84%; padding: 0in; height: 82px;" valign="top" width="84%"><br />';
    body += '                                                        <p class="x_x_topheader" style="margin: 0in; margin-bottom: .0001pt; text-align: center; line-height: 21.0pt;" align="center"><strong><span style="font-size: 21pt; font-family: Helvetica, sans-serif, serif, EmojiFont;" data-ogsc="rgb(51, 51, 51)">Reminder: "Surface Hub 2S: The Experience" webinar is tomorrow!</span></strong></p>';
    body += '                                                   </td>';
    body += '                                                   <td style="width: 8%; padding: 0in; height: 82px;" width="8%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 9px;">';
    body += '                                                   <td style="padding: 0in; height: 9px;" colspan="3">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 36px;">';
    body += '                                                   <td style="width: 8%; padding: 0in; height: 36px;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84%; padding: 0in; height: 36px;" valign="top" width="84%">';
    body += '                                                       <p class="x_x_bodycopy" style="margin: 0in; margin-bottom: .0001pt; line-height: 13.0pt;"><span style="font-size: 8.8pt; font-family: Helvetica, sans-serif, serif, EmojiFont;" data-ogsc="rgb(77, 77, 77)">Just a reminder that our Microsoft Surface Hub 2S webinar begins <strong>tomorrow, September 17th at 12:00 PM CT</strong>. We are excited to have you join us!</span></p>';
    body += '                                                   </td>';
    body += '                                                   <td style="width: 8%; padding: 0in; height: 36px;" width="8%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 30px;">';
    body += '                                                   <td style="padding: 0in; height: 30px;" colspan="3">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 82px;">';
    body += '                                                   <td style="width: 8%; padding: 0in; height: 82px;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84%; padding: 0in; height: 82px;" valign="top" width="84%"><br />';
    body += '                                                       <div align="center">';
    body += '                                                           <table class="x_x_MsoNormalTable" style="border-collapse: collapse; height: 40px;" border="0" width="184" cellspacing="0" cellpadding="0">';
    body += '                                                               <tbody>';
    body += '                                                                   <tr style="height: 30.0pt;">';
    body += '                                                                       <td style="width: 252px; background: #366ab3; padding: 0in; height: 30pt; text-align: center; vertical-align: middle;" data-ogsb="rgb(89, 203, 89)">';
    body += '                                                                           <p class="x_x_MsoNormal" align="center"><span style="color: white;"><a id="LPlnk646404" class="x_OWAAutoLink" style="color: #366ab3;" title="Join The Webinar" href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_NDJmZDk0MWQtZGY0Ny00MTcwLTk1YjUtNzEyNmY2ODMyZDVk%40thread.v2/0?context=%7b%22Tid%22%3a%2291d501ab-004e-444d-93e8-f7e8fbd65bfb%22%2c%22Oid%22%3a%22e69a2426-6c58-467e-8b40-a6a0faefb2f0%22%2c%22IsBroadcastMeeting%22%3atrue%7d" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: white; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;">Join Webinar</span></a></span></p>';
    body += '                                                                       </td>';
    body += '                                                                   </tr>';
    body += '                                                               </tbody>';
    body += '                                                           </table>';
    body += '                                                       </div>';
    body += '                                                   </td>';
    body += '                                               </tr>';
    body += '                                           </tbody>';
    body += '                                       </table>';
    body += '                                   </td>';
    body += '                               </tr>';
    body += '                           </tbody>';
    body += '                       </table>';
    body += '                   </div>';
    body += '               </td>';
    body += '           </tr>';
    body += '       </tbody>';
    body += '   </table>';
    body += '   <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse; border-color: white;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '       <tbody>';
    body += '           <tr>';
    body += '               <td style="padding: 0in 0in 0in 0in;" valign="top">';
    body += '                   <p class="x_x_infooter1" style="text-align: center;" align="center">&nbsp;</p>';
    body += '                   <p class="x_x_infooter1" style="text-align: center;" align="center">&nbsp;</p>';
    body += '                   <p class="x_x_infooter1" style="text-align: center;" align="center"><span style="font-size: 8.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: #c3c3c3;" data-ogsc="rgb(153, 153, 153)"><a class="x_OWAAutoLink" style="color: #e49fff;" title="View Map" href="https://www.google.com/maps/place/2075+E+Governors+Cir,+Houston,+TX+77092/@29.806549,-95.448371" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="color: #3f3f3f; text-decoration: none;" data-ogsc="rgb(153, 153, 153)">UnifiedCommunications.com, 2075 East Governors Circle, Houston, TX 77092<br><br></span></a></span></p>';
    body += '               </td>';
    body += '           </tr>';
    body += '       </tbody>';
    body += '   </table>';
    body += '</div>';

    return body;
}

function afterWebinar(firstName) {
    var body = '';
    body += '<div align="center">';
    body += '   <table class="x_x_MsoNormalTable" style="width: 6.25in; border-collapse: collapse;" border="0" width="600" cellspacing="0" cellpadding="0">';
    body += '       <tbody>';
    body += '           <tr>';
    body += '               <td style="padding: 0in 0in 0in 0in;" valign="top">';
    body += '                   <div align="center">';
    body += '                       <table class="x_x_MsoNormalTable" style="width: 100%; border-collapse: collapse; border-spacing: 0px;" border="0" width="100%" cellspacing="0" cellpadding="0" data-ogsb="white">';
    body += '                           <tbody>';
    body += '                               <tr style="height: 5.5pt;">';
    body += '                                   <td style="padding: 0in 0in 0in 0in; height: 5.5pt;">&nbsp;</td>';
    body += '                               </tr>';
    body += '                               <tr style="height: 16.5pt;">';
    body += '                                   <td style="padding: 0in 0in 0in 0in; height: 16.5pt;">&nbsp;</td>';
    body += '                               </tr>';
    body += '                               <tr>';
    body += '                                   <td style="padding: 0in 0in 0in 0in;"><br />';
    body += '                                       <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '                                           <tbody>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84.0%; padding: 0in 0in 0in 0in;" valign="top" width="84%"><br />';
    body += '                                                       <p class="x_x_topheader" style="margin: 0in; margin-bottom: .0001pt; text-align: center; line-height: 21.0pt;" align="center"><strong><span style="font-size: 20pt; font-family: Helvetica, sans-serif, serif, EmojiFont;" data-ogsc="rgb(51, 51, 51)">"Surface Hub 2S: The Experience" Webinar Recording &amp; Q&amp;A Transcript and Survey</span></strong></p>';
    body += '                                                   </td>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 9.0pt;">';
    body += '                                                   <td style="padding: 0in 0in 0in 0in; height: 9.0pt;" colspan="3">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84.0%; padding: 0in 0in 0in 0in;" valign="top" width="84%">';
    body += '                                                       <p class="x_x_bodycopy" style="margin: 0in; margin-bottom: .0001pt; line-height: 13.0pt;"><span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont;">Thank you again for attending our webinar, ' + firstName + '! The links have been corrected and you can access the recording of the webinar and the Q&A transcript below.</span></p>';
    body += '                                                   </td>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr style="height: 30.0pt;">';
    body += '                                                   <td style="padding: 0in 0in 0in 0in; height: 30.0pt;" colspan="3">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84%; padding: 0in; text-align: center; vertical-align: middle;" valign="top" width="84%"><br />';
    body += '                                                       <div align="center">';
    body += '                                                           <table class="x_x_MsoNormalTable" style="border-collapse: collapse; border-color: blue; height: 125px;" border="0" width="216" cellspacing="0" cellpadding="0">';
    body += '                                                               <tbody>';
    body += '                                                                   <tr style="height: 40px;">';
    body += '                                                                       <td style="width: 226px; background: #366ab3; padding: 0in; height: 40px;" data-ogsb="rgb(89, 203, 89)">';
    body += '                                                                           <div align="center">';
    body += '                                                                               <p class="x_x_MsoNormal" align="center"><span style="color: white;"><a id="LPlnk646404" class="x_OWAAutoLink" style="color: #366ab3;" title="Join The Webinar" href="https://www.youtube.com/watch?v=9zRsYUuyBBY" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: white; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;">View the recording</span></a></span></p>';
    body += '                                                                           </div>';
    body += '                                                                       </td>';
    body += '                                                                   </tr>';
    body += '                                                                   <tr style="height: 24px;">';
    body += '                                                                       <td style="width: 214px; background: white; padding: 0in; height: 24px;" data-ogsb="rgb(89, 203, 89)">&nbsp;</td>';
    body += '                                                                   </tr>';
    body += '                                                                   <tr style="height: 8px;">';
    body += '                                                                       <td style="width: 214px; background: white; padding: 0in; height: 40px; border: 2px solid #366ab3;" data-ogsb="rgb(89, 203, 89)">';
    body += '                                                                           <div align="center border: 10px solid blue">';
    body += '                                                                               <p class="x_x_MsoNormal" align="center"><span style="color: #366ab3;"><a id="LPlnk646404" class="x_OWAAutoLink" style="color: #366ab3;" title="Join The Webinar" href="https://www.unifiedcommunications.com/pdf/Q&A_Surface-Hub-2S-Experience-Webinar(UnifiedCommunications.com).pdf" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="font-size: 10pt; border: 5px; font-family: Helvetica, sans-serif, serif, EmojiFont; color: #366ab3; text-transform: uppercase; letter-spacing: 1.5pt; text-decoration: none;">Q&amp;A Transcript</span></a></span></p>';
    body += '                                                                           </div>';
    body += '                                                                       </td>';
    body += '                                                                   </tr>';
    body += '                                                               </tbody>';
    body += '                                                           </table>';
    body += '                                                      </div>';
    body += '                                                       <p style="text-align: left;"><span style="font-size: 11pt; font-family: Helvetica, sans-serif, serif, EmojiFont;"><br><strong><font color="#13cf8d"><font size="13pt">Take our survey and be entered to win a $25 Amazon gift card!</font></font></strong><br />Please consider taking our brief survey. We truly value your feedback and would love to hear your thoughts. Submit the survey by September 22nd to be entered to win a $25 Amazon gift card!<br><br>Thank you in advance!</span></p>';
    body += '                                                       <br />';
    body += '                                                       <table style="border-collapse: collapse; height: 50px; width: 185px; background-color: #366ab3; margin-left: auto; margin-right: auto;" border="2px solid rgb(54, 106, 179)" cellpadding="0in">';
    body += '                                                           <tbody>';
    body += '                                                               <tr style="align: center;">';
    body += '                                                                   <td style="width: 181px; background: #366ab3; padding: 0in; height: 40px; border: 2px solid #366ab3; text-align: center;"><span style="color: #ffffff; font-size: 10pt;"><a id="LPlnk646404" class="x_OWAAutoLink" style="color: white; text-decoration: none;" title="Join The Webinar" href="https://www.surveymonkey.com/r/H8LW8R3" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""><span style="font-family: Helvetica, sans-serif, serif, EmojiFont; text-transform: uppercase; letter-spacing: 1.5pt;">Take Survey</span></a></span></td>';
    body += '                                                               </tr>';
    body += '                                                           </tbody>';
    body += '                                                       </table>';
    body += '                                                       <br />';
    body += '                                                       <p style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-align: left;">If you have any further questions about anything you saw in the webinar or anything else, give us a call at <span style="text-decoration-color: #366ab3; color: #366ab3;"><u><a href="tel:800-641-6416">800.641.6416</a></u></span> or email us at <a style="text-decoration-color: #366ab3;" href="mailto:info@unifiedcommunications.com"><span style="color: #366ab3;">info@unifiedcommunications.com</span></a>. Our experts are always happy to assist in bringing people, knowledge, and ideas together through technology.</p>';
    body += '                                                       <p style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-align: left;">Sincerely,</p>';
    body += '                                                       <p style="font-size: 10pt; font-family: Helvetica, sans-serif, serif, EmojiFont; text-align: left;">The UnifiedCommunications.com Team</p>';
    body += '                                                   </td>';
    body += '                                               </tr>';
    body += '                                               <tr>';
    body += '                                                   <td style="width: 8.0%; padding: 0in 0in 0in 0in;" width="8%">&nbsp;</td>';
    body += '                                                   <td style="width: 84.0%; padding: 0in 0in 0in 0in;" valign="top" width="84%">&nbsp;</td>';
    body += '                                               </tr>';
    body += '                                           </tbody>';
    body += '                                       </table>';
    body += '                                   </td>';
    body += '                               </tr>';
    body += '                               <tr style="height: 30.0pt;">';
    body += '                                   <td>&nbsp;</td>';
    body += '                                   <td style="padding: 0in 0in 0in 0in; height: 30.0pt;">&nbsp;</td>';
    body += '                               </tr>';
    body += '                           </tbody>';
    body += '                       </table>';
    body += '                       &nbsp;</div>';
    body += '               </td>';
    body += '           </tr>';
    body += '       </tbody>';
    body += '   </table>';
    body += '   <br />';
    body += '   <table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '       <tbody>';
    body += '           <tr>';
    body += '               <td style="padding: 0in 0in 0in 0in;" valign="top"><br />';
    body += '                   <p class="x_x_infooter1" style="text-align: center;" align="center"><span style="font-size: 8.5pt; font-family: Helvetica, sans-serif, serif, EmojiFont; color: #c3c3c3;" data-ogsc="rgb(153, 153, 153)"> <a id="LPlnk479088" class="x_OWAAutoLink" style="color: #e49fff;" title="View Map" href="https://www.google.com/maps/place/2075+E+Governors+Cir,+Houston,+TX+77092/@29.806549,-95.448371" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""> <span style="color: #3f3f3f; text-decoration: none;" data-ogsc="rgb(153, 153, 153)">UnifiedCommunications.com, 2075 East Governors Circle, Houston, TX 77092 </span> </a> </span></p>';
    body += '               </td>';
    body += '           </tr>';
    body += '       </tbody>';
    body += '   </table>';
    body += '<table class="x_x_MsoNormalTable" style="width: 100.0%; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">';
    body += '    <tbody>';
    body += '        <tr>';
    body += '            <td style="width: 120.75pt; padding: 15.0pt 0in 11.25pt 7.5pt;" width="161"><br />';
    body += '                <p align="center" class="x_x_MsoNormal"><a class="x_OWAAutoLink" style="color: #424242;" title="Visit UnifiedCommunications.com" href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""> <span style="text-decoration: none;"> <img align="middle" id="x_x__x0000_i1025" style="width: 3in; display: block; margin-left: auto; margin-right: auto;" src="https://www.unifiedcommunications.com/skins/Skin_1/img/logo.png" alt="UnifiedCommunications Logo" width="161" border="" data-imagetype="External" /></span></a><a id="LPlnk129286" class="x_OWAAutoLink" style="color: #424242;" title="Visit UnifiedCommunications.com" href="http://www.unifiedcommunications.com/" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" data-ogsc=""></a></p>';
    body += '            </td>';
    body += '        </tr>';
    body += '    </tbody>';
    body += '</table>';
    body += '</div >';

    return body;
}

function disregardEmail(firstName) {
    var body = '';
    body += '<div>';
    body += '   <p>Hello ' + firstName + ',</p>';
    body += '   <p>Please disregard any emails you may have received from us regarding our webinar &ldquo;Surface Hub 2S: The Experience&rdquo; as starting either tomorrow or today. Our system had a hiccup and got a little too excited about the webinar and prematurely sent your reminders! We apologize for any confusion this has caused.</p>';
    body += '   <p><strong>The webinar is still slated to begin Tuesday, September 17<sup>th</sup> at 12:00 PM Central.</strong></p>';
    body += '   <p>Thank you again for registering, and&nbsp;we look forward to having you join us Tuesday!</p>';
    body += '   <p>If you have any questions in the meantime, feel free to email us at <u><a tabindex="-1" title="mailto:info@unifiedcommunications.com" href="mailto:info@unifiedcommunications.com" target="_blank" rel="noreferrer noopener">info@unifiedcommunications.com</a></u> or call us at 800-641-6416.</p>';
    body += '   <p>Sincerely,</p>';
    body += '   <p>The UnifiedCommunications.com Team</p>';
    body += '</div>';
    return body;
}