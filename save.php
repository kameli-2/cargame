<?php
date_default_timezone_set("Europe/Helsinki");
// Add data to hiscore table

if (isset($_GET['nick']) && isset($_GET['time'])) {
	$nick = $_GET['nick'];
	$time = (int)$_GET['time'];
	str_replace(",", ".", $nick);
	str_replace("\n", " ", $nick);

	$file = fopen("autopeli_hiscore.dat", "a");
	fwrite($file, $nick.",".$time.",".time()."\n");
	fclose($file);
}

// Return current hiscore table
$file = file("autopeli_hiscore.dat");
$hiscores = array();
foreach ($file as $score) {
	$hiscores[] = explode(",", $score);
}

usort($hiscores, 'sortByScore');

echo '<table>';
$i = 1;
foreach ($hiscores as $score) {
	echo '
		<tr>
			<td class="hiscore_nick">'.$i.'.</td>
			<td class="hiscore_nick">'.$score[0].'</td>
			<td class="hiscore_score">'.sprintf("%.1f", floor((int)$score[1]/100)/10).'</td>
			<td class="hiscore_date">'.date("j.n.Y", (int)$score[2]).'</td>
		</tr>
	';
	if (++$i > 10) break;
}
echo '</table>';

function sortByScore($a, $b) {
	if ($a[1] == $b[1]) return $a[2]-$b[2];
	return $a[1]-$b[1];
}
?>
