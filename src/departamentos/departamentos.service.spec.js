"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const departamentos_service_1 = require("./departamentos.service");
describe('DepartamentosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [departamentos_service_1.DepartamentosService],
        }).compile();
        service = module.get(departamentos_service_1.DepartamentosService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=departamentos.service.spec.js.map