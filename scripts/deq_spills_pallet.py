#!/usr/bin/env python
# * coding: utf8 *
'''
deq_spills_pallet.py

A module containing the pallet plugin for the deq-spills project.
'''

from forklift.models import Pallet
from os.path import join


class DEQSpillsPallet(Pallet):
    def build(self, configuration):
        self.arcgis_services = [('DEQSpills', 'MapServer')]

        self.sgid = join(self.garage, 'SGID10.sde')
        self.environment = r'C:\Scheduled\staging\environment.gdb'

        self.copy_data = [self.environment]

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
