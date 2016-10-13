/*
 * All Endpoints need to have at least the following:
 * annotationsList - current list of OA Annotations
 * dfd - Deferred Object
 * init()
 * search(options, successCallback, errorCallback)
 * create(oaAnnotation, successCallback, errorCallback)
 * update(oaAnnotation, successCallback, errorCallback)
 * deleteAnnotation(annotationID, successCallback, errorCallback) (delete is a reserved word)
 * TODO:
 * read() //not currently used
 *
 * Optional, if endpoint is not OA compliant:
 * getAnnotationInOA(endpointAnnotation)
 * getAnnotationInEndpoint(oaAnnotation)
 */
(function($){

  $.YCBAEndpoint = function(options) {

    jQuery.extend(this, {
      dfd:             null,
      annotationsList: [],
      windowID:        null,
      eventEmitter:    null
    }, options);

    this.init();
  };

  $.YCBAEndpoint.prototype = {
    init: function() {
      //whatever initialization your endpoint needs       
    },

    //Search endpoint for all annotations with a given URI in options
    search: function(options, successCallback, errorCallback) {
      var _this = this;
      console.log("search");
      //use options.uri
      jQuery.ajax({
        async: false,
        url: this.searchUrl,
        type: 'GET',
        dataType: 'json',
        headers: { },
        data: {
          canvas: options.uri
        },
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          jQuery.each(data, function(index, value) {
            value.endpoint = _this;
          });
          _this.annotationsList = data;
          if (typeof successCallback === "function") {
            successCallback(data);
          } else {
            _this.dfd.resolve(true);
          }
        },
        error: function() {
          console.log("search error");
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },
    
    //Delete an annotation by endpoint identifier
    deleteAnnotation: function(annotationID, successCallback, errorCallback) {
      var _this = this;        
      jQuery.ajax({
        async: false,
        url: annotationID,
        type: 'DELETE',
        dataType: 'json',
        headers: { },
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          if (typeof successCallback === "function") {
            successCallback();
          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },
    
    //Update an annotation given the OA version
    update: function(annotation, successCallback, errorCallback) {
      var _this = this;
      var oaAnnotation = jQuery.extend({}, annotation);
      var url = oaAnnotation['@id'];
      delete oaAnnotation.endpoint;  // avoid cyclic reference

      console.log(oaAnnotation);
      console.log(url);
      jQuery.ajax({
        //async: false,
        url: url,
        type: 'PUT',
        dataType: 'json',
        //headers: { },
        data: JSON.stringify(oaAnnotation),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          if (typeof successCallback === "function") {
            successCallback();
          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },

    //takes OA Annotation, gets Endpoint Annotation, and saves
    //if successful, MUST return the OA rendering of the annotation
    create: function(oaAnnotation, successCallback, errorCallback) {
      var _this = this;
      jQuery.ajax({
        async: false,
        url: this.baseUrl,
        type: 'POST',
        dataType: 'json',
        // headers: { },
        data: JSON.stringify(oaAnnotation),
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
          data.endpoint = _this;
          _this.annotationsList.push(data);
          if (typeof successCallback === "function") {
            successCallback(data);
          }
        },
        error: function() {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
      });
    },

    set: function(prop, value, options) {
      if (options) {
        this[options.parent][prop] = value;
      } else {
        this[prop] = value;
      }
    },

    //Convert Endpoint annotation to OA
    getAnnotationInOA: function(annotation) {
      return annotation;
    },

    // Converts OA Annotation to endpoint format
    getAnnotationInEndpoint: function(oaAnnotation) {
      return oaAnnotation;
    },

    userAuthorize: function(action, annotation) {
      return true; // allow all
    },

    getAnnotationList: function(key) {
      console.log("getAnnotationList");
      return this.annotationsList;
    }
  };

}(Mirador));
