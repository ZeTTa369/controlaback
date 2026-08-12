"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const refacciones_service_1 = require("./refacciones.service");
describe('RefaccionesService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [refacciones_service_1.RefaccionesService],
        }).compile();
        service = module.get(refacciones_service_1.RefaccionesService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=refacciones.service.spec.js.map