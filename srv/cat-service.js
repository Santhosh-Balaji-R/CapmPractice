const cds = require('@sap/cds');

module.exports = cds.service.impl((srv) => {

    /*********************************************************
     * GENERIC HANDLERS (ALL ENTITIES)
     *********************************************************/
    srv.before('*', async (req) => {
        console.log(`BEFORE -> Event: ${req.event}, Entity: ${req.target?.name}`);
    });

    srv.after('*', async (data, req) => {
        console.log(`AFTER -> Event: ${req.event}`);
    });


    /*********************************************************
     * CRUD EVENTS – books ENTITY
     *********************************************************/

    /* ========== BEFORE ========= */
    srv.before('CREATE', 'books', (req) => {
        console.log('Before CREATE books');

        // Validation
        if (!req.data.name) {
            req.error(400, 'Book name is mandatory');
        }

        // Auto ID generation
        if (!req.data.id) {
            req.data.id = Math.floor(Math.random() * 100000);
        }
    });

    srv.before('READ', 'books', () => {
        console.log('Before READ books');
    });

    srv.before('UPDATE', 'books', (req) => {
        console.log('Before UPDATE books');

        if (req.data.status === 'Approved') {
            req.reject(400, 'Approved books cannot be updated');
        }
    });

    srv.before('DELETE', 'books', () => {
        console.log('Before DELETE books');
    });


    /* ========== ON ========= */
    srv.on('CREATE', 'books', async (req) => {
        console.log('ON CREATE books');

        const tx = cds.tx(req);
        await tx.run(
            INSERT.into('books').entries(req.data)
        );

        return req.data;
    });

    srv.on('READ', 'books', async (req) => {
        console.log('ON READ books');
        return await cds.tx(req).run(req.query);
    });

    srv.on('UPDATE', 'books', async (req) => {
        console.log('ON UPDATE books');
        return req.data;
    });

    srv.on('DELETE', 'books', async () => {
        console.log('ON DELETE books');
    });


    /* ========== AFTER ========= */
    srv.after('CREATE', 'books', (data) => {
        console.log('After CREATE books', data);
    });

    srv.after('READ', 'books', () => {
        console.log('After READ books');
    });

    srv.after('UPDATE', 'books', () => {
        console.log('After UPDATE books');
    });

    srv.after('DELETE', 'books', () => {
        console.log('After DELETE books');
    });


    /*********************************************************
     * CUSTOM ACTION
     *********************************************************/
    srv.on('approveBook', async (req) => {
        const { id } = req.data;
        console.log(`Action approveBook for ID: ${id}`);

        await UPDATE('books')
            .set({ status: 'Approved' })
            .where({ id });

        return `Book ${id} approved successfully`;
    });


    /*********************************************************
     * CUSTOM FUNCTION
     *********************************************************/
    srv.on('getBookCount', async () => {
        const result = await SELECT.one
            .from('books')
            .columns('count(*) as count');

        return result.count;
    });


    /*********************************************************
     * DRAFT EVENTS (Fiori Elements)
     *********************************************************/
    srv.before('NEW', 'books', () => {
        console.log('Draft NEW books');
    });

    srv.before('PATCH', 'books', () => {
        console.log('Draft PATCH books');
    });

    srv.before('SAVE', 'books', () => {
        console.log('Draft SAVE books');
    });


    /*********************************************************
     * ERROR HANDLING EXAMPLE
     *********************************************************/
    srv.before('CREATE', 'books', (req) => {
        if (req.data.name === 'Error') {
            throw new Error('Forced error for testing');
        }
    });

});
