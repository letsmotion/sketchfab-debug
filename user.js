// ==UserScript==
// @name          Sketchfab Model Debug
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @version       0.8.5
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @description   Inserts buttons on model pages to load debug info and other tools
// @include       https://sketchfab.com/*
// @exclude       https://sketchfab.com/models/*/embed*
// @exclude       https://sketchfab.com/models/*/edit*
// @exclude       https://sketchfab.com/admin/*
// @include       https://sketchfab-local.com/*
// @exclude       https://sketchfab-local.com/models/*/embed*
// @exclude       https://sketchfab-local.com/models/*/edit*
// @exclude       https://sketchfab-local.com/admin/*
// @grant         none
// @require       https://rawgit.com/jsoma/tabletop/master/src/tabletop.js
// ==/UserScript==

var $ = window.publicLibraries.$,
    _ = window.publicLibraries._;

$(document).ready(function() {

    var currentPage = window.location.href;

    setInterval(function() {
        if (currentPage !== window.location.href) {
            currentPage = window.location.href;
            onUpdateURL();
        }
    }, 2000);

    onUpdateURL();

    var apiPublic, apiInternal, me, pathname, origin;

    function onUpdateURL() {
        // Global URLs
        origin = window.location.origin;
        pathname = window.location.pathname;
        apiPublic = origin + '/v2';
        apiInternal = origin + '/i';

        me = prefetchedData['/i/users/' + prefetchedData['/i/users/me'].uid];

        // need to be logged in
        if (!me)
            return;

        $('#sketchfab-debug-script').remove();

        // If we're on model search results, show published warning
        if ((pathname === '/models' || pathname.match('models/categories')) && me.isStaff) {

            var searchQuery = window.location.search,
                prefix = '&';

            if (!searchQuery.match('status=published')) {

                if (searchQuery === '')
                    prefix = '?';

                $('.explore-container').before(
                    '<div class="container responsive" id="sketchfab-debug-script">' +
                    ' <div class="actionmessage">' +
                    '  <div class="actionmessage-inner">' +
                    '   <h2 class="actionmessage-title">Friendly Reminder:</h2>' +
                    '    <div> Staff can see all models in this view. Did you mean to see <a href="' + pathname + searchQuery + prefix + 'status=published" style="text-decoration: underline;"> Only Published Models </a>?' +
                    '    </div>' +
                    '  </div>' +
                    ' </div>' +
                    '</div>'
                );

            }
        }

        // If we're on a model page, define the model ID and run the main model function
        else if (pathname.match(/\/models\//) && !pathname.match(/\/models\/staffpicks/) && !pathname.match(/\/models\/popular/)) {
            showModelAdmin(pathname.replace('/models/', ''));
        }

        // If we're on a user profile, add the user admin button
        else if ($('.profile-header').length && me.isStaff) {
            showUserAdmin(true);
        }
    }

    // Create user admin button
    function showUserAdmin(isUserProfile) {

        if (!me.isStaff)
            return;

        var username = isUserProfile ? pathname.split('/')[1] : prefetchedData['/i' + pathname].user.username,
            userAdminButton = '<a id="user-admin" href="" class="button btn-' + (isUserProfile ? 'small' : 'medium') + ' btn-tertiary" target="_blank"><i class="icon fa fa-wrench" style="margin-right: 0;"></i></a>';

        // Add the button to the profile page or model page
        if (isUserProfile) {

            $('.profile-header .actions').append(userAdminButton);

        } else {

            var userUID = prefetchedData['/i' + pathname].user.uid,
                userURL = apiInternal + '/users/' + userUID;

            $.get(userURL, function(data) {
                var modelCount = data.modelCount,
                    memberSince = data.createdAt,
                    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    date = new Date(memberSince),
                    memberSinceParsed = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear(),
                    memberSinceElement = '<section class="model-meta-row member-since"><i class="model-meta-icon icon fa fa-user"></i><p class="model-meta-info">Member Since: ' + memberSinceParsed + '</p></section>',
                    modelCountElement = '<section class="model-meta-row model-count"><i class="model-meta-icon icon fa fa-list-ol"></i><p class="model-meta-info">Model Count: ' + modelCount + '</p></section>';

                $('section.publication').after(memberSinceElement, modelCountElement);

            });

            $('.whoami').css('margin', '10px 20px 0')
                .find('.display-name').prepend(userAdminButton)
                .find('#user-admin').css('margin-right', '10px');
        }

        $('#user-admin').attr('href', origin + '/admin/skfb_users/skfbuser/?username=' + username);

    }

    // Main model function
    function showModelAdmin(modelId) {

        var modelData = prefetchedData['/i' + pathname],

            // URLs
            modelAdmin = '/admin/skfb_models/model/' + modelId + '/change/',
            modelEdit = '/models/' + modelId + '/edit?debug3d=1',
            modelInspect = 'http://sketchfab.github.io/experiments/model-inspector/index.html?urlid=' + modelId,

            // Main model buttons
            debugButton = '<a id="debug">Debug</a>',
            statsButton = '<a id="stats">Stats</a>',
            editButton = '<a href="' + modelEdit + '" target="_blank">Edit</a>',
            spButton = '<a class="button btn-medium btn-secondary" id="staffpick-model"><i class="loading-light" style="margin-top: 5px"></i></a>',
            optimizeButton = '<a id="optimize-model">Optimize</a>',
            adminButton = '<a href="' + modelAdmin + '" target="_blank">Admin</a>',
            inspectButton = '<a href="' + modelInspect + '" target="_blank">Inspect</a>',

            // Properties button
            propButton = '<a id="prop" class="button btn-medium btn-tertiary" style="margin-right: 10px;"><i class="icon fa fa-wrench" style="margin-right: 0;"></i></a>',

            // Staffpick status
            isStaffpicked = !!$('.model-name a.flag-staffpicked').length,
            staffpickButtonText = '<i class="custom-icons icon-staffpicks-icon" style="padding-right: 1px;"></i>',
            staffpickButtonClass = isStaffpicked ? 'btn-important' : 'btn-secondary',

            // Private
            isPrivate = !!$('.private').length,

            // Model data
            faceCount = {
                'count': modelData.faceCount,
                'thresholdMed': 500000,
                'thresholdHigh': 1000000,
                'selector': 'triangles'
            },

            vertexCount = {
                'count': modelData.vertexCount,
                'thresholdMed': 250000,
                'thresholdHigh': 500000,
                'selector': 'vertices'
            },

            geometryCount = {
                'count': 0,
                'thresholdMed': 50,
                'thresholdHigh': 100,
                'selector': 'geometries'
            },

            textureCount = {
                'count': 0,
                'thresholdMed': 20,
                'thresholdHigh': 40,
                'selector': 'textures-count'
            },

            materialCount = {
                'count': 0,
                'thresholdMed': 20,
                'thresholdHigh': 50,
                'selector': 'materials-count'
            },

            boneCount = {
                'count': 0,
                'thresholdMed': 34,
                'thresholdHigh': 100,
                'selector': 'bones'
            },

            filesizeTextures = {
                'count': 0,
                'thresholdMed': 20000000,
                'thresholdHigh': 50000000,
                'selector': 'filesize-textures'
            },

            filesizeModel = {
                'count': 0,
                'thresholdMed': 20000000,
                'thresholdHigh': 50000000,
                'selector': 'filesize-model'
            },

            VRAMTotalMax = {
                'count': 0,
                'thresholdMed': 256000000,
                'thresholdHigh': 1000000000,
                'selector': 'texture-vram'
            },

            // Don't need threshold
            uvCount = 0,
            VRAMTotalMin = 0,
            hasUncompressedTextures = false,

            // Page status
            debugOpen = false,
            statsOpen = false,

            // Main page markup
            contentInfos = '<section class="model-meta-row geometries">' +
            '<i class="model-meta-icon icon fa fa-cubes"></i>' +
            '<p class="model-meta-info"><span class="count" id="geometries"></span> geometries</p>' +
            '</section>' +
            '<section class="model-meta-row textures-count">' +
            '<i class="model-meta-icon icon fa fa-picture-o"></i>' +
            '<a id="show-textures"><p class="model-meta-info"><span class="count" id="textures-count">0</span> textures</p></a>' +
            '</section>' +
            '<section class="model-meta-row materials-count">' +
            '<i class="model-meta-icon icon fa fa-tasks"></i>' +
            '<p class="model-meta-info"><span class="count" id="materials-count"></span> materials</p>' +
            '</section>' +
            '<section class="model-meta-row uvmaps">' +
            '<i class="model-meta-icon icon fa fa-map-o"></i>' +
            '<p class="model-meta-info"><span class="count" id="uvmaps">0</span> UV maps</p>' +
            '</section>' +
            '<section class="model-meta-row bones">' +
            '<i class="model-meta-icon icon fa fa-link"></i>' +
            '<p class="model-meta-info"><span class="count" id="bones">0</span> bones</p>' +
            '</section>' +
            '<section class="model-meta-row extension">' +
            '<i class="model-meta-icon icon fa fa-file-o"></i>' +
            '<p class="model-meta-info"><span class="count" id="extension">.' + modelData.ext + '</span></p>' +
            '</section>' +
            '<section class="model-meta-row filesize-textures">' +
            '<i class="model-meta-icon icon fa fa-cloud-download"></i>' +
            '<p class="model-meta-info"><span class="count" id="filesize-textures"></span> download (textures)</p>' +
            '</section>' +
            '<section class="model-meta-row filesize-model">' +
            '<i class="model-meta-icon icon fa fa-cloud-download"></i>' +
            '<p class="model-meta-info"><span class="count" id="filesize-model"></span> download (model)</p>' +
            '</section>' +
            '<section class="model-meta-row texture-vram">' +
            '<i class="model-meta-icon icon fa fa-laptop"></i>' +
            '<p class="model-meta-info"><span class="count" id="texture-vram"></span> VRAM</p>' +
            '</section>' +
            '<section class="model-meta-row data-source" style="display: none;">' +
            '<i class="model-meta-icon icon fa fa-wrench"></i>' +
            '<p class="model-meta-info">Data source: <span class="count" id="data-source"></span></p>' +
            '</section>' +
            '<section class="model-meta-row data-source-tool" style="display: none;">' +
            '<i class="model-meta-icon icon fa fa-wrench"></i>' +
            '<p class="model-meta-info">Data source tool: <span class="count" id="data-source-tool"></span></p>' +
            '</section>' +
            '<div id="model-data-margin" style="height: 30px;"></div>';

        $('.sidebar-box.informations section.vertices')
            .css('margin-bottom', '0')
            .after(contentInfos);

        if ($('.sidebar-box.informations:first() .sidebar-title').length === 1) {
            $('#model-data-margin').remove();
        }

        if (modelData.animationCount === 0) {
            $('section.bones').remove();
        }

        $('.main .additional').before(
            '<div id="textures" class="staticGridRow" style="display: none;">' +
            '<h5>Textures</h5>' +
            '</div>' +
            '<div id="thumbnails" class="staticGridRow" style="display: none;">' +
            '<h5>Thumbnails</h5>' +
            '<div class="block">' +
            '<div id="thumbnail"></div>' +
            '</div>' +
            '</div>' +
            '<div id="materials-wrapper" class="staticGridRow" style="display: none;">' +
            '<h5>Materials</h5>' +
            '<div class="block">' +
            '<ul id="materials" style="margin-left: 15px;"></ul>' +
            '</div>' +
            '</div>'
        );

        $('#textures, #thumbnails, #materials-wrapper').css({
            'margin-top': '20px',
            'border-radius': '2px',
            'padding': '20px',
            'font-size': '14px',
            'line-height': '24px',
            'background': '#fff',
            'box-shadow': '0 1px 5px 0 rgba(85,85,85,.15)'
        });

        $('.left h5').css({
            'width': '100%',
            'font-weight': '400',
            'padding': '15px'
        });

        $('.additional div.actions').append(
            '<div class="button btn-medium btn-secondary admin-settings show-hover-menu">' +
            '<i class="icon fa fa-wrench"></i>' +
            '<i class="fa fa-caret-down caret"></i>' +
            '<ul class="hover-menu quicksettings corner">' +
            '<li>' + editButton + '</li>' +
            (me.isStaff ? '<li>' + adminButton + '</li>' : '') +
            '<li>' + inspectButton + '</li>' +
            '<li>' + debugButton + '</li>' +
            '<li>' + statsButton + '</li>' +
            '<li>' + optimizeButton + '</li>' +
            '</ul>' +
            '</div>'
        );

        if (me.isStaff) {

            // Add buttons
            $('.additional .actions .like-button').before(spButton);
            $('.informations .sidebar-title:first').prepend(propButton);
            showUserAdmin(false);

            // Staffpick status
            if (isStaffpicked) {
                // var spDisagreeButton = '<a target="_blank" href="mailto:community+staffpicks@sketchfab.com?subject=Bad+Staffpick&body=Someone%20staffpicked%20this%20model%3A%20' + origin + pathname + '%0A%0AI%20don%27t%20think%20it%20should%20be%20staffpicked%20because..." class="button btn-danger" style="font-size: 15px; margin-left: 10px;">I AM NOT AGREE!!</a>';
                // $( 'span.model-name' ).append( spDisagreeButton );
                updateStaffpickStatus(true);
            } else if (isPrivate) {
                updateStaffpickStatus(false);
            } else {
                staffpickBlacklist();
            }
        }

        // Events
        $('#debug').on('click', openDebug);
        $('#stats').on('click', openStats);
        $('#prop').on('click', openProps);
        $('#optimize-model').on('click', optimizeModel);
        $('#show-textures').on('click', function() {
            var e = $('#textures'),
                d = e.css('display');
            if (d === 'none') {
                e.css('display', 'flex');
            } else if (d === 'flex') {
                e.css('display', 'none');
            }
        });

        getModelInfo(modelId);

        function checkModelDataThresholds() {

            [faceCount, vertexCount, geometryCount, textureCount, materialCount, boneCount, filesizeTextures, filesizeModel, VRAMTotalMax].forEach(function(e) {
                if (e.count >= e.thresholdMed && e.count < e.thresholdHigh) {
                    $('section.' + e.selector)
                        .css('color', '#FF9E3A')
                        .find('a').css('color', 'inherit');
                } else if (e.count >= e.thresholdHigh) {
                    $('section.' + e.selector)
                        .css('color', '#FF2826')
                        .find('a').css('color', 'inherit');
                }
            });

        }

        // Staff Pick Blacklisting
        function staffpickBlacklist() {

            var public_spreadsheet_url = '1l3vuw5va5t64_bXFLmYiLAXZLLPqPKwg9cAEyIKnnks';

            function parseSheet(blacklist) {

                console.log('Successfully got Staff Pick Blacklist');

                var modelId = pathname.replace('/models/', ''),
                    modelObj = prefetchedData['/i/models/' + modelId],
                    modelUser = modelObj.user.username,
                    modelTags = modelObj.tags,
                    blacklistTags = [],
                    blacklistTagsStrings = [],
                    isStaffpickable = true;

                blacklist.Models.elements.forEach(function(model) {
                    if (model.Model === modelId) {
                        var reason = 'Model ' + modelId + ' blacklisted by ' + model.Owner + ' because "' + model.Reason + '"';
                        isStaffpickable = false;
                        updateStaffpickStatus(false, reason);
                        return;
                    }
                });

                blacklist.Users.elements.forEach(function(user) {
                    if (user.User === modelUser) {
                        var reason = 'User ' + modelUser + ' blacklisted by ' + user.Owner + ' because "' + user.Reason + '"';
                        isStaffpickable = false;
                        updateStaffpickStatus(false, reason);
                        return;
                    }
                });

                blacklist.Tags.elements.forEach(function(tag) {
                    blacklistTags.push(tag);
                    blacklistTagsStrings.push(tag.Tag);
                });

                if (blacklistTags) {
                    var badTags = _.intersection(blacklistTagsStrings, modelTags);

                    if (badTags.length > 0) {
                        var badTag = blacklistTags[blacklistTagsStrings.indexOf(badTags[0])],
                            reason = 'Tag ' + badTag.Tag + ' blacklisted by ' + badTag.Owner + ' because "' + badTag.Reason + '"';
                        isStaffpickable = false;
                        updateStaffpickStatus(false, reason);
                        return;
                    }
                }

                if (isStaffpickable) {
                    updateStaffpickStatus(true);
                }

            }

            Tabletop.init({
                key: public_spreadsheet_url,
                callback: parseSheet,
                simpleSheet: false
            });

        }

        function updateStaffpickStatus(isStaffpickable, reason) {

            if (isStaffpickable) {

                $('#staffpick-model')
                    .html(staffpickButtonText)
                    .toggleClass(staffpickButtonClass + ' btn-secondary')
                    .unbind('click')
                    .on('click', staffpickModel);

            } else {

                $('#staffpick-model')
                    .html('<strike>' + staffpickButtonText + '</strike>')
                    .toggleClass('btn-secondary btn-tertiary')
                    .unbind('click')
                    .on('click', function() {
                        window.alert(isPrivate ? 'Private' : (reason + '\n\nhttps://docs.google.com/spreadsheets/d/1l3vuw5va5t64_bXFLmYiLAXZLLPqPKwg9cAEyIKnnks/edit'));
                    });
            }
        }

        // Optimize a model
        function optimizeModel() {

            var url = apiInternal + pathname + '/optimize';

            if (!confirm('Are you sure?')) {
                return;
            }

            $.ajax({
                type: 'POST',
                url: url,
                success: function( /*xhr*/ ) {
                    if (debugOpen) {
                        openDebug();
                    } else {
                        location.reload();
                    }
                },
                error: function(xhr) {
                    console.error(xhr);
                }
            });
        }

        // Staffpick / Unstaffpick a model
        function staffpickModel() {

            var url = apiInternal + pathname + '/staffpick',
                likeButton = $('.button[data-action="like-model"]')[0],
                isLiked = $(likeButton).hasClass('liked');

            if (!confirm('Are you sure?')) {
                return;
            }

            if (!isLiked && !isStaffpicked) {
                likeButton.click();
            }

            $.ajax({
                type: 'POST',
                url: url,
                success: function( /*xhr*/ ) {
                    location.reload();
                },
                error: function(xhr) {
                    console.error(xhr);
                }
            });
        }

        // Create properties dialog for editing models that don't belong to me
        function openProps() {

            var form,
                payload = {
                    name: modelData.name,
                    description: modelData.description,
                    tags: modelData.tags,
                    isPrivate: modelData.isPrivate,
                    license: modelData.license ? modelData.license.uid : null
                },
                content = '<div class="sidebar-box informations">' +
                '<form id="prop-form" action="" enctype="multipart/form-data">' +
                '<p>Name:</p>' +
                '<input name="name" type="text" style="width: 100%;" value="' + payload.name + '">' +
                '<p>Description:</p>' +
                '<textarea name="description" style="width: 100%; height: 300px;">' + payload.description + '</textarea>' +
                '<p>Tags (space separated):</p>' +
                '<textarea name="tags" style="width: 100%; height: 100px;">' + payload.tags.toString().replace(/,/g, ' ') + '</textarea>' +
                '<p>Categories:</p>' +
                '<input class="category" type="checkbox" name="animals-creatures" value="ed9e048550b2478eb1ab2faaba192832"> Animals & Creatures<br>' +
                '<input class="category" type="checkbox" name="architecture" value="f825c721edb541dbbc8cd210123616c7"> Architecture<br>' +
                '<input class="category" type="checkbox" name="cars-vehicles" value="22a2f677efad4d7bbca5ad45f9b5868e"> Cars & Vehicles<br>' +
                '<input class="category" type="checkbox" name="characters" value="2d643ff5ed03405b9c34ecdffff9d8d8"> Characters<br>' +
                '<input class="category" type="checkbox" name="cultural-heritage" value="86f23935367b4a1f9647c8a20e03d716"> Cultural Heritage<br>' +
                '<input class="category" type="checkbox" name="gaming" value="3badf36bd9f549bdba295334d75e04d3"> Gaming<br>' +
                '<input class="category" type="checkbox" name="places-scenes" value="c51b29706d4e4e93a82e5eea7cbe6f91"> Places & Scenes<br>' +
                '<input class="category" type="checkbox" name="products-technology" value="d7cebaeca8604ebab1480e413404b679"> Products & Technology<br>' +
                '<input class="category" type="checkbox" name="science-nature-education" value="17d20ca7b35243d4a45171838b50704c"> Science, Nature & Education<br>' +
                '<input class="category" type="checkbox" name="weapons" value="3f8d0eab859c45ae8ea3af1033d6f3e4"> Weapons<br>' +
                '<p>Private?' +
                '<input id="isPrivate" class="form-checkbox" type="checkbox" name="isPrivate"' + (payload.isPrivate ? ' checked' : '') + '>' +
                '<label class="form-checkbox-actor" for="isPrivate" style="margin-left: 10px"></label>' +
                '</p>' +
                '<p>License:</p>' +
                '<select name="license">' +
                '<option value="">-----</option>' +
                '<option value="322a749bcfa841b29dff1e8a1bb74b0b">CC Attribution</option>' +
                '<option value="b9ddc40b93e34cdca1fc152f39b9f375">CC Attribution-ShareAlike</option>' +
                '<option value="72360ff1740d419791934298b8b6d270">CC Attribution-NoDerivs</option>' +
                '<option value="bbfe3f7dbcdd4122b966b85b9786a989">CC Attribution-NonCommercial</option>' +
                '<option value="2628dbe5140a4e9592126c8df566c0b7">CC Attribution-NonCommercial-ShareAlike</option>' +
                '<option value="34b725081a6a4184957efaec2cb84ed3">CC Attribution-NonCommercial-NoDerivs</option>' +
                /*'<option value="7c23a1ba438d4306920229c12afcb5f9">CC0 Public Domain</option>' +*/
                '</select>' +
                '<input class="button btn-medium btn-secondary" name="Submit" type="submit">' +
                '</form>' +
                '</div>';

            function patchModel() {

                $.ajax({
                    url: apiPublic + pathname + '?token=' + me.apiToken,
                    data: JSON.stringify(payload),
                    type: 'PATCH',
                    contentType: 'application/json',
                    traditional: true,

                    success: function( /*response*/ ) {
                        location.reload();
                    },

                    error: function(response) {
                        console.error(response);
                    }
                });
            }

            // Remove the button to prevent opening multiple forms
            $('a#prop').remove();

            // Add the new content
            $('div.owner').after(content);
            form = $('#prop-form')[0];
            $('#prop-form select[name="license"]').val(payload.license);
            modelData.categories.forEach(function(v) {
                $('#prop-form .category[value="' + v.uid + '"]').prop('checked',true);
            });

            form.onsubmit = function() {
                var newCategories = [];
                payload.name = form.name.value;
                payload.description = form.description.value;
                payload.tags = form.tags.value.split(' ');
                payload.license = form.license.value;
                payload.isPrivate = form.isPrivate.checked ? true : false;

                $('#prop-form .category:checked').each(function() {
                    newCategories.push($(this).val());
                });
                payload.categories = newCategories;

                patchModel();

                return false; // Prevent redirect
            };
        }

        // Replace model viewer with debug info
        function openDebug() {

            if (!debugOpen) {
                $('.right, .comments, .footer').css('display', 'none');

                var urlIframeLocation = $('.viewer-object').contents().get(0);
                var url = urlIframeLocation.location.href;
                if (~~url.indexOf('#')) url+= '#';
                urlIframeLocation .location.href = url + ',debug3d=1,';

                $('#textures, #thumbnails, #materials-wrapper').css('display', 'flex');
                debugOpen = true;
            }else {
                $('#textures, #thumbnails, #materials-wrapper').css('display', 'none');
                $('main.viewer').html('<iframe class="viewer-object" src="' + pathname + '/embed?internal=1&watermark=0&autostart=0"></iframe>');
                $('.right, .comments, .footer').css('display', '');
                debugOpen = false;
            }
            $('#textures div').toggleClass('col-4 col-2');
        }

             // Replace model viewer with stats info
        function openStats() {

            if (!statsOpen) {
                $('.right, .comments, .footer').css('display', 'none');

                var urlIframeLocation = $('.viewer-object').contents().get(0);
                var url = urlIframeLocation.location.href;
                if (~~url.indexOf('#')) url+= '#';
                urlIframeLocation .location.href = url + ',stats=1,';

                $('#textures, #thumbnails, #materials-wrapper').css('display', 'flex');
                statsOpen = true;
            }else {
                $('#textures, #thumbnails, #materials-wrapper').css('display', 'none');
                $('main.viewer').html('<iframe class="viewer-object" src="' + pathname + '/embed?internal=1&watermark=0&autostart=0"></iframe>');
                $('.right, .comments, .footer').css('display', '');
                statsOpen = false;
            }
            $('#textures div').toggleClass('col-4 col-2');
        }


        function humanSize(size) {

            var suffixes = [' b', ' KiB', ' MiB', ' GiB'];

            for (var i = 0; i < suffixes.length; i++, size /= 1024) {
                if (size < 1024)
                    return Math.floor(size) + suffixes[i];
            }
            return Math.floor(size) + suffixes[suffixes.length - 1];
        }

        function displayImage(image, isTexture) {

            var imgs = $('<div>').css('margin-bottom', '10px').addClass('col-4'),
                visibleImage,
                visibleImageObj;

            if (!isTexture) {

                // Show the biggest thumbnail
                visibleImageObj = image.images[image.images.length - 1];
                visibleImage = $('<img/>')
                    .attr({
                        'src': visibleImageObj.url,
                        'crossorigin': 'anonymous',
                    })
                    .css({
                        'max-width': '600px',
                        'height': 'auto'
                    });

            } else {

                // Show the 128 texture if it exists
                visibleImageObj = _.filter(image.images, function(img) {
                    return img.height === 128 && img.width === 128;
                })[0];

                // Fallback to the 32
                if (!visibleImageObj) {
                    visibleImageObj = _.filter(image.images, function(img) {
                        return img.height === 32 && img.width === 32;
                    })[0];
                }

                // Fallback to the last texture
                if (!visibleImageObj) {
                    visibleImageObj = image.images[image.images.length - 1];
                }

                visibleImage = $('<img/>')
                    .attr({
                        'src': visibleImageObj.url,
                        'crossorigin': 'anonymous',
                        'height': 128,
                        'width': 128
                    });
            }

            imgs.append(visibleImage);

            if (image.images.length > 0) {

                var isMax = true,
                    firstFormat,
                    extraFormat = {
                        'images': []
                    };

                image.images.forEach(function(img) {
                    var a = $('<a/>').attr({
                            'href': img.url,
                            'target': '_blank'
                        })
                        .text(img.width + 'x' + img.height + ' - ' + humanSize(img.size));

                    if (isTexture && img.options.format) {

                        var format = img.options.format;

                        if (!firstFormat) {
                            firstFormat = format;
                        }

                        if (format === firstFormat) {
                            var channels,
                                VRAMMin = 0,
                                VRAMMax = img.height * img.width * 4;

                            if (format === 'RGB') {
                                channels = 3;
                            } else if (format.match(/[ANR]{1}/)) {
                                channels = 1;
                            }

                            VRAMMin = img.height * img.width * channels;

                            if (isMax) {
                                VRAMTotalMax.count += VRAMMax;
                                VRAMTotalMin += VRAMMin;
                                filesizeTextures.count += img.size;
                                isMax = false;
                            }

                            a.text(a.text() + ' - ' + format /* + ' (' + humanSize( VRAMMin ) + ' - ' + humanSize( VRAMMax ) + ' VRAM)'*/ );
                        } else {
                            extraFormat.images.push(img);
                            a = null;
                        }
                    }

                    if (a) {
                        imgs.append('<br>', a);
                    }

                });

                if (extraFormat.images.length > 0) {
                    textureCount.count++;
                    $('#textures-count').text(textureCount.count);
                    checkModelDataThresholds();
                    $('#textures').append(displayImage(extraFormat, true));
                }
            }

            return imgs;
        }

        function getModelInfo(urlid) {

            // Get osg data (geometries, source tool, UVs, bones...)
            function getOsgjs(osgjsUrl) {

                $.get(osgjsUrl, function(json) {

                    var data = JSON.parse(json),
                        textures = {};

                    // Traverse json to extract model data
                    function traverse(children) {
                        for (var i in children) {
                            if (children.hasOwnProperty(i)) {
                                var node = children[i];

                                if (typeof(node) === 'object') {
                                    traverse(node);
                                }

                                if (i === 'osg.Geometry') {
                                    geometryCount.count++;
                                    $('#geometries').text(geometryCount.count);
                                } else if (node === 'model_file_wireframe.bin.gz') {
                                    geometryCount.count--;
                                    $('#geometries').text(geometryCount.count);
                                } else if (i === 'osg.Texture' && node.File) {
                                    var url = 'https://media.sketchfab.com/urls/' + urlid + '/' + node.File;
                                    if (!textures[url]) {
                                        textures[url] = true;
                                    }
                                } else if (i === 'UserDataContainer') {
                                    var dataValues = node.Values;
                                    for (var j = 0; j < dataValues.length; j++) {
                                        var dataValue = dataValues[j];
                                        if (dataValue.Name === 'source') {
                                            $('section.data-source').css('display', '');
                                            $('#data-source').text(dataValue.Value);
                                        } else if (dataValue.Name === 'source_tool' || dataValue.Name === 'authoring_tool') {
                                            $('section.data-source-tool').css('display', '');
                                            $('#data-source-tool').text(dataValue.Value);
                                        }
                                    }
                                } else if (i === 'VertexAttributeList') {
                                    var texcoords = JSON.stringify(node).match(/TexCoord/g);
                                    if (texcoords) {
                                        uvCount = Math.max(uvCount, texcoords.length);
                                        $('#uvmaps').text(uvCount);
                                    }
                                } else if (i === 'BoneMap') {
                                    if (Object.keys(node).length > boneCount.count) {
                                        boneCount.count = Object.keys(node).length;
                                        $('#bones').text(boneCount.count);
                                    }
                                }
                            }
                        }
                    }

                    traverse(data);
                    checkModelDataThresholds();

                });
            }

            // Get materials and thumbnails
            $.get(apiInternal + pathname, function(data) {

                var osgjsUrl = data.files[0].osgjsUrl;

                filesizeModel.count += data.files[0].osgjsSize + data.files[0].wireframeSize + data.files[0].modelSize;
                $('#filesize-model').text(humanSize(filesizeModel.count));

                // Materials
                Object.keys(data.options.materials).forEach(function(material_id) {
                    if (material_id != 'updatedAt') {
                        materialCount.count++;
                        $('#materials').append($('<li>').text(data.options.materials[material_id].name));
                    }
                });

                $('#materials-count').text(materialCount.count);

                checkModelDataThresholds();

                // Thumbnails
                $('#thumbnail').append(displayImage(data.thumbnails, false));

                // Get OSGJS
                getOsgjs(osgjsUrl);
            });

            // Textures
            $.get(apiInternal + pathname + '/textures', function(data) {

                data.results.forEach(function(texture) {

                    var isCompressed = false;

                    texture.images.forEach(function(tex) {
                        isCompressed = isCompressed || !!tex.options.quality;
                    });

                    if (isCompressed) {
                        textureCount.count++;
                        $('#textures-count').text(textureCount.count);
                    } else {
                        hasUncompressedTextures = true;
                    }

                    $('#textures').append(displayImage(texture, true));

                });

                if (textureCount.count === 0) {
                    $('section.texture-vram, section.filesize-textures, section.uvmaps').remove();
                    if (!hasUncompressedTextures) {
                        $('a#show-textures p').unwrap();
                        $('#textures').remove();
                    } else {
                        $('#textures-count').prepend('<span><i class="fa fa-exclamation-triangle"></i> </span>');
                    }
                } else {
                    $('#texture-vram').text(humanSize(VRAMTotalMin) + ' - ' + humanSize(VRAMTotalMax.count));
                    $('#filesize-textures').text(humanSize(filesizeTextures.count));
                }

                checkModelDataThresholds();

            });
        }
    }

});
