function getGcode() {
  
  var ss = SpreadsheetApp.getActive().getSheetByName("PerceForm");
 
  // capter parametres fixe
  var clearance = ss.getRange("B2").getValue();
  var depthPerPass = ss.getRange("B3").getValue();
  var holeDepth = ss.getRange("B4").getValue();
  
  var plungeRate = ss.getRange("B6").getValue();
  var rapidSpeed = ss.getRange("B7").getValue();
  
    // commentaires
  var clrCom = " (Move to clearance level)\n\n";
  var n = "\n";  
  
  /** define sous programme avec variables 
      en fonction de holeDepth divise par depthPerPass (peck)**/
  
  // debut
  var sp = "(sous program - sp)"+n+"O0100"+n+"G1 X#101 Y#102 F"+rapidSpeed+n;
  // define total pecks = holeDepth / depthPerPass, adjuster pour le reste
  var pecks = Math.floor(holeDepth / depthPerPass)
  // s'il en reste, ajoute une plonge
  if (holeDepth % depthPerPass > 0) pecks += 1;
  // creer milieu du sp (chaque peck / plonge)
  for (var i=0;i<pecks;i++){
    // line 1 - rapid plonge
    var t = "G1 Z-"+(i*depthPerPass)+" F"+rapidSpeed+n;
    sp+=t;
    
    // line 2 - percer
    var deep = ((i+1)*depthPerPass);
    if (deep > holeDepth) deep = holeDepth;
    t = "G1 Z-"+deep+" F"+plungeRate+n;
    sp+=t;
    
    // line 3 - move to clearance
    t = "G1 Z"+clearance+" F"+rapidSpeed+n;
    sp+=t;
  }
  // retourne au pp
  sp+="M99";

  /** capter trous X, Y **/
  // get all values in column E regardless of quantity
  var xCol = ss.getRange("E1:E").getValues();
  // js function .filter(criterion) returns a 2d array
  // https://www.w3schools.com/jsref/jsref_filter.asp
  // [[10.0], [15.0], [20.0], [25.0], [30.0], ...
  var xVals = xCol.filter(Number);
  var xLen = xVals.length;
  //Logger.log(xVals[1][0]);
  
  // et y
  var yCol = ss.getRange("F1:F").getValues();
  var yVals = yCol.filter(Number);
  
  //
  var pp = "(commence programme principal)"+n;
    
  for (var i=0;i<xLen;i++) {
    
    // commentaire
    pp+="(Trou No. "+(i+1)+")"+n;
    // set X
    pp+="#101="+xVals[i][0]+" ( X )"+n;
    // set Y
    pp+="#102="+yVals[i][0]+" ( Y )"+n;
    // sous programme appel
    pp+="M98 P100 (appel sp)"+n;
    
  }
  // fin
  pp+="M30"+n+n;
  // debut code
  var debut = "G90 (Absolute positioning)\n"
    +"G1 X0 Y0"+ " F" +rapidSpeed+n
    +"G1 Z"+clearance+ " F" +rapidSpeed+clrCom;
  
  return debut+pp+sp;
}