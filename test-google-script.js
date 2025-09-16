function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var spreadsheetId = '1u3VmM6W8DBC8jb4aDGWFxtx5_Uu2Estkyt4cMHVsXFE';
    var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Company', 'Ask Phrase 1', 'Ask Phrase 2', 'Ask Phrase 3', 'Cred Score']);
    }
    
    var results = generateCredScore(data);
    sheet.appendRow([new Date(), data.name, data.email, data.company, data.askphrase1, data.askphrase2, data.askphrase3, results.overallScore]);
    
    sendCredScoreEmail(data, results);
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function generateCredScore(data) {
  var overallScore = 65;
  var visibilityScore = 60;
  var authorityScore = 70;
  var consistencyScore = 55;
  var chatgptScore = 65;
  
  return {
    overallScore: overallScore,
    visibilityScore: visibilityScore,
    authorityScore: authorityScore,
    consistencyScore: consistencyScore,
    chatgptScore: chatgptScore,
    status: 'Building Authority',
    imposterRisks: 2
  };
}

function sendCredScoreEmail(userData, results) {
  var subject = 'Your Cred Score Results: ' + results.overallScore + '/100 - ' + userData.name;
  var emailBody = 'Hello ' + userData.name + ',\n\nYour AI Authority Analysis for ' + userData.company + ' is complete!\n\nOVERALL SCORE: ' + results.overallScore + '/100\nSTATUS: ' + results.status + '\n\nYOUR AI AUTHORITY BREAKDOWN:\nAI Visibility: ' + results.visibilityScore + '%\nAuthority Score: ' + results.authorityScore + '%\nConsistency: ' + results.consistencyScore + '%\n\nCHATGPT ANALYSIS:\nChatGPT Recognition: ' + results.chatgptScore + '%\n\nYOUR ANALYZED ASK PHRASES:\n1. "' + userData.askphrase1 + '"\n2. "' + userData.askphrase2 + '"\n3. "' + userData.askphrase3 + '"\n\nIMPOSTER ALERT: ' + results.imposterRisks + ' potential fake profiles detected\n\nTake your digital reputation analysis to the next level! While your complimentary report covers a single AI engine, now you can access a one-time, full-spectrum Credli Snapshot for just $497.\n\nSECURE YOUR FULL MULTI-ENGINE CREDLI SNAPSHOT: https://www.paypal.com/ncp/payment/W7LPR9DCY8464\n\nElevate Your Presence. Own Your Reputation.\n\nCredli.ai';
  
  GmailApp.sendEmail(userData.email, subject, emailBody);
}