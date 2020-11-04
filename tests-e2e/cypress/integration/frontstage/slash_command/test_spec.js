// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// ***************************************************************

describe('slash command > test', () => {
    const playbookName = 'Playbook (' + Date.now() + ')';
    let teamId;
    let userId;
    let playbookId;

    before(() => {
        // # Login as user-1.
        cy.apiLogin('user-1');

        // # Switch to clean display mode.
        cy.apiSaveMessageDisplayPreference('clean');

        // # Create a playbook.
        cy.apiGetTeamByName('ad-1').then((team) => {
            teamId = team.id;
            cy.apiGetCurrentUser().then((user) => {
                userId = user.id;

                cy.apiGetUserByEmail('sysadmin@sample.mattermost.com').then((admin) => {
                    cy.apiCreatePlaybook({
                        teamId: team.id,
                        title: playbookName,
                        checklists: [
                            {
                                title: 'Stage 1',
                                items: [
                                    {title: 'Step 1'},
                                    {title: 'Step 2'},
                                ],
                            },
                            {
                                title: 'Stage 2',
                                items: [
                                    {title: 'Step 1'},
                                    {title: 'Step 2'},
                                ],
                            },
                        ],
                        memberIDs: [user.id, admin.id],
                    }).then((playbook) => {
                        playbookId = playbook.id;
                    });
                });
            });
        });
    });

    describe('as an admin', () => {
        describe('with EnableTesting set to false', () => {
            before(() => {
                // # Login as sysadmin.
                cy.apiLogin('sysadmin');

                cy.apiGetConfig().then((response) => {
                    cy.log("Before updating: ");
                    cy.log(response.config.ServiceSettings.EnableTesting);
                });

                // # Set EnableTesting to false.
                cy.apiUpdateConfig({
                    ServiceSettings: {
                        EnableTesting: false
                    },
                }).then(() => {
                    cy.apiGetConfig().then((response) => {
                        cy.log("After updating : ");
                        cy.log(response.config.ServiceSettings.EnableTesting);
                    });
                })


            });

            beforeEach(() => {
                // # Login as sysadmin.
                cy.apiLogin('sysadmin');

                // # Navigate to a channel.
                cy.visit('/ad-1/channels/town-square');
            });

            it('fails to run subcommand bulk-data', () => {
                // # Execute the bulk-data command.
                cy.executeSlashCommand('/incident test bulk-data');

                // * Verify the ephemeral message warns that the user is not admin.
                cy.verifyEphemeralMessage('Setting EnableTesting must be set to true to run the test command.');
            });
        });
    });
});
