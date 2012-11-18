<!DOCTYPE html>
<html>
  <head>
    <title>Piano</title>
    <meta name="viewport" content="user-scalable=0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
	<link href="css/ui-darkness/jquery-ui-1.9.1.custom.css" rel="stylesheet">
	<script src="js/jquery-1.8.2.js"></script>
	<script src="js/jquery-ui-1.9.1.custom.js"></script>
    <script type="text/javascript" src="touch.js"></script>
 
    <script type="text/javascript" src="jquery.ui.touch-punch.min.js"></script>
	<meta name="viewport" content="width=device-width, initial-scale=1"> 
    <link rel="stylesheet" type="text/css" href="touch.css" />
    <link rel="apple-touch-icon" href="appicon.png" />
	<link rel="apple-touch-startup-image" href="startup.png">

  </head>
  <body>
  <div id="box">
  <div id="result"></div>
  <form action="submit.php" id="someform" method="post">
  Give it a title: <input type="text" id="title" name="title">
  <input type="hidden" id="data" value="" name="data">
  <input type="submit" id="subm" value="Save">
  </form>
  
  	<div id="url"></div>
  
 		<a href="#" id="twitter">twitter</a>      
        <a href="#" id="googleplus">google_plus</a>
        <a href="#" id="facebook">facebook</a>
        
	<div id="existing">
	<?php
		include("config.php");
		$query = "select * from piano";
		$result = mysql_query($query);
		while ($row = mysql_fetch_assoc($result)) {
		echo "<p><a href='http://www.rioleo.org/piano/?p=".$row["data"]."'>".$row["title"]."</a></p>";
		}
		
		?>
	</div>


  </div>

   <ul class="toolbar2">
    
      <li>
	      <a href="#" id="start">Start</a>
	      <a href="#" id="stop">Stop</a>
	      <a href="#" id="clear">Clear</a>
	      <a href="#" id="save">Save/Gallery</a>
      </li>
      <input type="number" id="rows" min="16" max="80" />
      <div id="tempo"></div>
      <div id="tempotextbox">
	      <input type="number" id="tempotext" value="100" />
      </div>
    </ul>
    
	<div id="canvasarea"></div>



    <ul class="toolbar">
    
      <li>
	      <a href="#" id="major" class="key">Major</a>
	      <a href="#" id="minor" class="key">Minor</a>
	      <a href="#" id="guitar" class="instrument">Guitar</a>
	      <a href="#" id="piano" class="instrument">Piano</a>
	      <a href="#" id="vinolin" class="instrument">Violin</a>
	      <a href="#" id="sticky">Sticky</a>
      </li>
    </ul>
    
  <div id="barsarea">

    
    <script type="text/javascript">

    $("#someform").submit(function() {
			event.preventDefault();
			$("#subm").attr("disabled", 'disabled');
			$.post("submit.php", $("#someform").serialize(), function(data) {
				$("#result").html(data);
				$("#existing").append("<p><a href='index.php?p="+$("#data").val()+"'>"+$("#title").val()+"</a></p>");
				$("#title").val('');
				$("#subm").attr("disabled", '');
			});
		});
		
	$("#" + localStorage.getItem('instrument')).addClass("selected");
	
    
    $("ul.toolbar").css("margin-top", ($(window).height()-20)+"px");
    $("#barsarea").css("height", $(window).height()+"px");
    $("#sticky").addClass(localStorage.getItem('sticky'));
    
    $(function() {
    	 <?php if (isset($_GET["p"])) {
    	
    	?>
       loopLength = <?=$_GET["r"]?>;
       
       <?php } ?>
    for (var i=0;i<loopLength;i++) {
    	str = "";
    	str += "<div class='bars'>";
    	for (var j=0;j<theArray.length;j++) {
    		
    		str += "<div class='"+i+" bar"+j+" bar "+localStorage.getItem(i+"-"+j)+"'></div>";
    	}
    	str += "</div>";
    	$("#barsarea").append(str);
    	$("#canvasarea").append("<canvas id='content"+i+"'></canvas>");
    	$("#content"+i).css("margin-top", 5+(i*52) + "px");
    }
    for (var i = 0; i < loopLength; i++) {
        id = 'content' + i;
        init();
    }
    for (var j = 0; j < theArray.length - 1; j++) {
        $(".bar" + j).css("width", theArray[j + 1] - theArray[j] + "px");
        $(".bar" + j).attr("freq", theArray[j]);
    }
     <?php if (isset($_GET["p"])) {
    	
    	?>
    	localStorage.clear();
    	bitstringDecode("<?=$_GET["p"]?>");
    	
    	$("#sticky").addClass("selected");
    	$("#tempotext").val(parseInt("<?=$_GET["t"]?>"));
		$("#rows").val(parseInt("<?=$_GET["r"]?>"));

    	$("#tempo").slider("value", parseInt("<?=$_GET["t"]?>"));
    	instrument = "<?=$_GET["i"]?>";
    	$("#"+instrument).addClass("selected");
    	$("#sticky").addClass(localStorage.getItem('sticky'));
    	
    	<?php
    }?>

    });


    </script>
</div>
    
    </div>
  </body>
</html>
