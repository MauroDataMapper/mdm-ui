'use strict';

angular.module('constants')
.constant('ROLES',
    {
        map:{
            'ADMINISTRATOR': 'Administrator',
            'EDITOR':'Editor',
            'PENDING':'Pending'
        },
        array:[
            {value:'ADMINISTRATOR', text:'Administrator'},
            {value:'EDITOR', text:'Editor'},
            {value:'PENDING', text:'Pending'}
        ],
        notPendingArray:[
            {value:'ADMINISTRATOR', text:'Administrator'},
            {value:'EDITOR', text:'Editor'},
        ]
    }

);
