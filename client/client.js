const grpc = require('grpc');
const protoloader = require('@grpc/proto-loader');
const { createInterface } = require('readline');

const reader = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const proto = grpc.loadPackageDefinition(
    protoloader.loadSync('../proto/vacaciones.proto', {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const REMOTE_URL = '0.0.0.0:50050';

const client = new proto.work_leave.EmployeeLeaveDaysService(REMOTE_URL, grpc.credentials.createInsecure());

let employee = {}
reader.question('Ingrese ID de empleado: ', answer => {
    employee.employee_id = answer;
    reader.question('Ingrese nombre de empleado: ', answer => {
        employee.name = answer;
        reader.question('Ingrese cantidad de dias de vacaciones acumulados: ', answer => {
            employee.accrued_leave_days = answer;
            reader.question('Ingrese cantidad de dias de permiso pedidos: ', answer => {
                employee.requested_leave_days = answer;
                client.EligibleForLeave(employee, (error, res) => {
                    if (!error) {
                        if (res.eligible) {
                            client.grantLeave(employee, (error, res) => {
                                console.log(res);
                            })
                        } else {
                            console.log('No se le puede autorizar el permiso')
                        }
                    } else {
                        console.log(error.message);
                    }
                    reader.close();
                })
            });
        });
    });
});