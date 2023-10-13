(function ( $ ) {
	'use strict';

	$( window ).on(
		'elementor/frontend/init',
		function () {
			qodefAddonsElementor.init();
			qodefAddonsElementorPromoWidgets.init();

		}
	);

	var qodefAddonsElementor = {
		init: function () {
			var isEditMode = Boolean( elementorFrontend.isEditMode() );

			if ( isEditMode ) {
				for ( var key in qodefAddonsCore.shortcodes ) {
					for ( var keyChild in qodefAddonsCore.shortcodes[key] ) {
						qodefAddonsElementor.reInitShortcode(
							key,
							keyChild
						);
					}
				}
			}
		},
		reInitShortcode: function ( key, keyChild ) {
			elementorFrontend.hooks.addAction(
				'frontend/element_ready/' + key + '.default',
				function ( e ) {
					// Check if object doesn't exist and print the module where is the error
					if ( typeof qodefAddonsCore.shortcodes[key][keyChild] === 'undefined' ) {
						console.log( keyChild );
					} else if ( typeof qodefAddonsCore.shortcodes[key][keyChild].initSlider === 'function' && e.find( '.qodef-qi-swiper-container' ).length ) {
						var $sliders = e.find( '.qodef-qi-swiper-container' );
						if ( $sliders.length ) {
							$sliders.each(
								function () {
									qodefAddonsCore.shortcodes[key][keyChild].initSlider( $( this ) );
								}
							);
						}
					} else if ( typeof qodefAddonsCore.shortcodes[key][keyChild].initItem === 'function' && e.find( '.qodef-shortcode' ).length ) {
						qodefAddonsCore.shortcodes[key][keyChild].initItem( e.find( '.qodef-shortcode' ) );
					} else {
						qodefAddonsCore.shortcodes[key][keyChild].init();
					}
				}
			);
		},
	};

	var qodefAddonsElementorPromoWidgets = {
		init: function () {
			if ( typeof elementor !== 'undefined' ) {
				elementor.hooks.addFilter(
					'panel/elements/regionViews',
					function ( panel ) {
						var qodeWidgetsPromoHandler,
							elementsView   = panel.elements.view,
							categoriesView = panel.categories.view;

						qodeWidgetsPromoHandler = {
							
							className: function () {
									var className = 'elementor-element-wrapper';
									if (!this.isEditable() ) {
										className += ' elementor-element--promotion';
										
										if ( this.isQodeWidget() ){
											className += ' qodef-element--promotion';
										}
									}
									return className;
							},
							
							isQodeWidget: function () {

								if ( undefined !== this.model.get( 'name' ) ) {
									return 0 === this.model.get( 'name' ).indexOf( 'qi_' );
								}
							},

							getElementObj: function ( key ) {

								var widgetObj = elementor.config.promotionWidgets.find(
									function ( widget, index ) {
										if ( widget.name == key ) {
											return true;
										}
									}
								);

								return widgetObj;

							},

							onMouseDown: function () {
								var actionURL = elementor.config.elementPromotionURL.replace(
									'%s',
									this.model.get( 'name' )
								),
								title     = this.model.get( 'title' ),
								content   = sprintf(
									wp.i18n.__(
										'Use %s widget and dozens more pro features to extend your toolbox and build sites faster and better.',
										'qi-addons-for-elementor'
									),
									title
								),
								promotion = elementor.config.promotion.elements;

								if ( this.isQodeWidget() ) {
									var widgetObject = this.getElementObj( this.model.get( 'name' ) );
									if ( typeof widgetObject.helpUrl !== 'undefined' ) {
										actionURL = widgetObject.helpUrl;
									}
									
									content = sprintf(
										wp.i18n.__(
											'The %s comes with advanced professional functionalities and an even smoother website-making experience. %s Upgrade Qi Addons for Elementor %s',
											'qi-addons-for-elementor'
										),
										title,
										'<a class="qodef-dialog-box-link" target="_blank" href="https://qodeinteractive.com/pricing/">',
										'</a>'
									);
								}

								elementor.promotion.showDialog(
									{
										/* translators: %s: Widget Title. */
										title: sprintf(
											wp.i18n.__(
												'%s Widget',
												'qi-addons-for-elementor'
											),
											title
										),
										content: content,
										position: {
											blockStart: '-7'
										},
										targetElement: this.el,
										actionButton: {
											// eslint-disable-next-line @wordpress/valid-sprintf
											url: actionURL,
											text: promotion.action_button.text,
											classes: promotion.action_button.classes || ['elementor-button', 'go-pro']
										}
									}
								);

							}
						};

						panel.elements.view = elementsView.extend(
							{
								childView: elementsView.prototype.childView.extend( qodeWidgetsPromoHandler )
							}
						);

						panel.categories.view = categoriesView.extend(
							{
								childView: categoriesView.prototype.childView.extend(
									{
										childView: categoriesView.prototype.childView.prototype.childView.extend( qodeWidgetsPromoHandler )
									}
								)
							}
						);

						return panel;
					}
				);
			}
		},
	};

})( jQuery );
