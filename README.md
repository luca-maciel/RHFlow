@ Windows

$env:RHFLOW_ADMIN_NAME="Administrador"
$env:RHFLOW_ADMIN_EMAIL="admin@rhflow.local"
$env:RHFLOW_ADMIN_PASSWORD="SuaSenhaForteCom12Caracteres"

.\mvnw.cmd spring-boot:run

# Linux

export RHFLOW_ADMIN_NAME="Administrador"
export RHFLOW_ADMIN_EMAIL="admin@rhflow.local"
export RHFLOW_ADMIN_PASSWORD="SuaSenhaForteCom12Caracteres"

./mvnw spring-boot:run
