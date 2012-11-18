		<?php
		
			include("config.php");
			
			
			// Take in parameters
			$data = $_POST["data"];
			$title = $_POST["title"];
			
			// Insert into orders
			// but oops query is not defined... yet
			
			$query = "insert into piano (title, data) values ('$title','$data')";
			
			$result = mysql_query($query);
			
			if ($result) {
				// What do the following lines do? Answer -> #1
			
				echo "<p>Successfully saved!</p>";
					
			}
			
			
			?>