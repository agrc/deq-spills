#!/usr/bin/env python
# * coding: utf8 *
'''
deq_spills_pallet.py

A module containing the pallet plugin for the deq-spills project.
'''

from os.path import join

from forklift.models import Pallet


class DEQSpillsPallet(Pallet):
    def build(self, configuration):
        self.arcgis_services = [('DEQSpills/MapService', 'MapServer'),
                                ('DEQSpills/ReferenceLayers', 'MapServer')]

        self.sgid = join(self.garage, 'SGID.sde')
        self.environment = join(self.staging_rack, 'environment.gdb')
        self.boundaries = join(self.staging_rack, 'boundaries.gdb')
        self.health = join(self.staging_rack, 'health.gdb')

        self.copy_data = [self.environment, self.boundaries, self.health]

        self.add_crates(['BFNONTARGETED',
                         'BFTARGETED',
                         'SITEREM',
                         'NPL',
                         'EWA',
                         'FUD',
                         'MMRP',
                         'TIER2',
                         'TRI',
                         'FACILITYUST',
                         'VCP',
                         'EnvironmentalIncidents'],
                        {'source_workspace': self.sgid,
                         'destination_workspace': self.environment})

        self.add_crate(('Counties', self.sgid, self.boundaries))
        self.add_crate(('HealthDistricts2015', self.sgid, self.health))
