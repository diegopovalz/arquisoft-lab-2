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

const employees = [
    {
        employee_id: '1',
        name: 'Diego Poveda',
        accrued_leave_days: 10,
        requested_leave_days: 4
    },
    {
        employee_id: '2',
        name: 'Pedro Saldarriaga',
        accrued_leave_days: 5,
        requested_leave_days: 5
    },
    {
        employee_id: '3',
        name: 'Kevin Carmona',
        accrued_leave_days: 2,
        requested_leave_days: 10
    },
    {
        employee_id: '4',
        name: 'Pepito Paez',
        accrued_leave_days: 3,
        requested_leave_days: 1
    },
    {
        employee_id: '5',
        name: 'Angelina Jolie',
        accrued_leave_days: 10,
        requested_leave_days: 20
    },
];

reader.question('Ingrese el ID del empleado: ', answer => {
    const employee = employees.find(e => e.employee_id === answer);
    if (employee) {
        client.EligibleForLeave(employee, (error, res) => {
            if (!error) {
                if (res.eligible) {
                    client.grantLeave(employee, (error, res) => {
                        console.log(`Permiso garantizado a ${employee.name}.`);
                        console.log(res);
                    })
                } else {
                    console.log(`No se le puede autorizar el permiso a: ${employee.name}`);
                }
            } else {
                console.log(error.message);
            }
        })
    } else {
        console.log(`No existe ningún empleado con el ID: ${answer}`);
    }
    reader.close();
});