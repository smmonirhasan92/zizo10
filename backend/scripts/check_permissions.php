<?php
// Save this file as 'check_permissions.php' in your public_html or backend folder
header('Content-Type: text/plain');

echo "Rocket 🚀 Permissions Checker\n";
echo "=============================\n";

$dirs = [
    './uploads',
    './logs',
    './backend/uploads', // Adjust based on your structure
    './backend/logs'
];

foreach ($dirs as $dir) {
    if (file_exists($dir)) {
        $perms = substr(sprintf('%o', fileperms($dir)), -4);
        echo "DIR: $dir | PERMS: $perms | ";
        
        if (is_writable($dir)) {
            echo "✅ WRITABLE\n";
        } else {
            echo "❌ NOT WRITABLE (Fix permissions to 755 or 777)\n";
        }
    } else {
        echo "⚠️ MISSING: $dir (Create it)\n";
    }
}

echo "\nNode Version Check:\n";
echo shell_exec('node -v');

echo "\nDisk Space:\n";
echo shell_exec('df -h .');
?>
