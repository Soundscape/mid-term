/* tslint:disable no-http-string */
var NAMESPACE_W3 = 'http://www.w3.org/';
/* tslint:enable no-http-string */
var NAMESPACE_SVG = NAMESPACE_W3 + "2000/svg";
var NAMESPACE_XLINK = NAMESPACE_W3 + "1999/xlink";
var emptyArray = [];
var extend = function (base, overrides) {
    var result = {};
    Object.keys(base).forEach(function (key) {
        result[key] = base[key];
    });
    if (overrides) {
        Object.keys(overrides).forEach(function (key) {
            result[key] = overrides[key];
        });
    }
    return result;
};
var same = function (vnode1, vnode2) {
    if (vnode1.vnodeSelector !== vnode2.vnodeSelector) {
        return false;
    }
    if (vnode1.properties && vnode2.properties) {
        if (vnode1.properties.key !== vnode2.properties.key) {
            return false;
        }
        return vnode1.properties.bind === vnode2.properties.bind;
    }
    return !vnode1.properties && !vnode2.properties;
};
var checkStyleValue = function (styleValue) {
    if (typeof styleValue !== 'string') {
        throw new Error('Style values must be strings');
    }
};
var findIndexOfChild = function (children, sameAs, start) {
    if (sameAs.vnodeSelector !== '') {
        // Never scan for text-nodes
        for (var i = start; i < children.length; i++) {
            if (same(children[i], sameAs)) {
                return i;
            }
        }
    }
    return -1;
};
var checkDistinguishable = function (childNodes, indexToCheck, parentVNode, operation) {
    var childNode = childNodes[indexToCheck];
    if (childNode.vnodeSelector === '') {
        return; // Text nodes need not be distinguishable
    }
    var properties = childNode.properties;
    var key = properties ? (properties.key === undefined ? properties.bind : properties.key) : undefined;
    if (!key) { // A key is just assumed to be unique
        for (var i = 0; i < childNodes.length; i++) {
            if (i !== indexToCheck) {
                var node = childNodes[i];
                if (same(node, childNode)) {
                    throw new Error(parentVNode.vnodeSelector + " had a " + childNode.vnodeSelector + " child " + (operation === 'added' ? operation : 'removed') + ", but there is now more than one. You must add unique key properties to make them distinguishable.");
                }
            }
        }
    }
};
var nodeAdded = function (vNode) {
    if (vNode.properties) {
        var enterAnimation = vNode.properties.enterAnimation;
        if (enterAnimation) {
            enterAnimation(vNode.domNode, vNode.properties);
        }
    }
};
var removedNodes = [];
var requestedIdleCallback = false;
var visitRemovedNode = function (node) {
    (node.children || []).forEach(visitRemovedNode);
    if (node.properties && node.properties.afterRemoved) {
        node.properties.afterRemoved.apply(node.properties.bind || node.properties, [node.domNode]);
    }
};
var processPendingNodeRemovals = function () {
    requestedIdleCallback = false;
    removedNodes.forEach(visitRemovedNode);
    removedNodes.length = 0;
};
var scheduleNodeRemoval = function (vNode) {
    removedNodes.push(vNode);
    if (!requestedIdleCallback) {
        requestedIdleCallback = true;
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(processPendingNodeRemovals, { timeout: 16 });
        }
        else {
            setTimeout(processPendingNodeRemovals, 16);
        }
    }
};
var nodeToRemove = function (vNode) {
    var domNode = vNode.domNode;
    if (vNode.properties) {
        var exitAnimation = vNode.properties.exitAnimation;
        if (exitAnimation) {
            domNode.style.pointerEvents = 'none';
            var removeDomNode = function () {
                if (domNode.parentNode) {
                    domNode.parentNode.removeChild(domNode);
                    scheduleNodeRemoval(vNode);
                }
            };
            exitAnimation(domNode, removeDomNode, vNode.properties);
            return;
        }
    }
    if (domNode.parentNode) {
        domNode.parentNode.removeChild(domNode);
        scheduleNodeRemoval(vNode);
    }
};
var setProperties = function (domNode, properties, projectionOptions) {
    if (!properties) {
        return;
    }
    var eventHandlerInterceptor = projectionOptions.eventHandlerInterceptor;
    var propNames = Object.keys(properties);
    var propCount = propNames.length;
    var _loop_1 = function (i) {
        var propName = propNames[i];
        var propValue = properties[propName];
        if (propName === 'className') {
            throw new Error('Property "className" is not supported, use "class".');
        }
        else if (propName === 'class') {
            toggleClasses(domNode, propValue, true);
        }
        else if (propName === 'classes') {
            // object with string keys and boolean values
            var classNames = Object.keys(propValue);
            var classNameCount = classNames.length;
            for (var j = 0; j < classNameCount; j++) {
                var className = classNames[j];
                if (propValue[className]) {
                    domNode.classList.add(className);
                }
            }
        }
        else if (propName === 'styles') {
            // object with string keys and string (!) values
            var styleNames = Object.keys(propValue);
            var styleCount = styleNames.length;
            for (var j = 0; j < styleCount; j++) {
                var styleName = styleNames[j];
                var styleValue = propValue[styleName];
                if (styleValue) {
                    checkStyleValue(styleValue);
                    projectionOptions.styleApplyer(domNode, styleName, styleValue);
                }
            }
        }
        else if (propName !== 'key' && propValue !== null && propValue !== undefined) {
            var type = typeof propValue;
            if (type === 'function') {
                if (propName.lastIndexOf('on', 0) === 0) { // lastIndexOf(,0)===0 -> startsWith
                    if (eventHandlerInterceptor) {
                        propValue = eventHandlerInterceptor(propName, propValue, domNode, properties); // intercept eventhandlers
                    }
                    if (propName === 'oninput') {
                        /* tslint:disable no-this-keyword no-invalid-this only-arrow-functions no-void-expression */
                        (function () {
                            // record the evt.target.value, because IE and Edge sometimes do a requestAnimationFrame between changing value and running oninput
                            var oldPropValue = propValue;
                            propValue = function (evt) {
                                oldPropValue.apply(this, [evt]);
                                evt.target['oninput-value'] = evt.target.value; // may be HTMLTextAreaElement as well
                            };
                        }());
                        /* tslint:enable */
                    }
                    domNode[propName] = propValue;
                }
            }
            else if (projectionOptions.namespace === NAMESPACE_SVG) {
                if (propName === 'href') {
                    domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                }
                else {
                    // all SVG attributes are read-only in DOM, so...
                    domNode.setAttribute(propName, propValue);
                }
            }
            else if (type === 'string' && propName !== 'value' && propName !== 'innerHTML') {
                domNode.setAttribute(propName, propValue);
            }
            else {
                domNode[propName] = propValue;
            }
        }
    };
    for (var i = 0; i < propCount; i++) {
        _loop_1(i);
    }
};
var addChildren = function (domNode, children, projectionOptions) {
    if (!children) {
        return;
    }
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var child = children_1[_i];
        createDom(child, domNode, undefined, projectionOptions);
    }
};
var initPropertiesAndChildren = function (domNode, vnode, projectionOptions) {
    addChildren(domNode, vnode.children, projectionOptions); // children before properties, needed for value property of <select>.
    if (vnode.text) {
        domNode.textContent = vnode.text;
    }
    setProperties(domNode, vnode.properties, projectionOptions);
    if (vnode.properties && vnode.properties.afterCreate) {
        vnode.properties.afterCreate.apply(vnode.properties.bind || vnode.properties, [domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]);
    }
};
var createDom = function (vnode, parentNode, insertBefore, projectionOptions) {
    var domNode;
    var start = 0;
    var vnodeSelector = vnode.vnodeSelector;
    var doc = parentNode.ownerDocument;
    if (vnodeSelector === '') {
        domNode = vnode.domNode = doc.createTextNode(vnode.text);
        if (insertBefore !== undefined) {
            parentNode.insertBefore(domNode, insertBefore);
        }
        else {
            parentNode.appendChild(domNode);
        }
    }
    else {
        for (var i = 0; i <= vnodeSelector.length; ++i) {
            var c = vnodeSelector.charAt(i);
            if (i === vnodeSelector.length || c === '.' || c === '#') {
                var type = vnodeSelector.charAt(start - 1);
                var found = vnodeSelector.slice(start, i);
                if (type === '.') {
                    domNode.classList.add(found);
                }
                else if (type === '#') {
                    domNode.id = found;
                }
                else {
                    if (found === 'svg') {
                        projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
                    }
                    if (projectionOptions.namespace !== undefined) {
                        domNode = vnode.domNode = doc.createElementNS(projectionOptions.namespace, found);
                    }
                    else {
                        domNode = vnode.domNode = (vnode.domNode || doc.createElement(found));
                        if (found === 'input' && vnode.properties && vnode.properties.type !== undefined) {
                            // IE8 and older don't support setting input type after the DOM Node has been added to the document
                            domNode.setAttribute('type', vnode.properties.type);
                        }
                    }
                    if (insertBefore !== undefined) {
                        parentNode.insertBefore(domNode, insertBefore);
                    }
                    else if (domNode.parentNode !== parentNode) {
                        parentNode.appendChild(domNode);
                    }
                }
                start = i + 1;
            }
        }
        initPropertiesAndChildren(domNode, vnode, projectionOptions);
    }
};
var updateDom;
/**
 * Adds or removes classes from an Element
 * @param domNode the element
 * @param classes a string separated list of classes
 * @param on true means add classes, false means remove
 */
var toggleClasses = function (domNode, classes, on) {
    if (!classes) {
        return;
    }
    classes.split(' ').forEach(function (classToToggle) {
        if (classToToggle) {
            domNode.classList.toggle(classToToggle, on);
        }
    });
};
var updateProperties = function (domNode, previousProperties, properties, projectionOptions) {
    if (!properties) {
        return;
    }
    var propertiesUpdated = false;
    var propNames = Object.keys(properties);
    var propCount = propNames.length;
    for (var i = 0; i < propCount; i++) {
        var propName = propNames[i];
        // assuming that properties will be nullified instead of missing is by design
        var propValue = properties[propName];
        var previousValue = previousProperties[propName];
        if (propName === 'class') {
            if (previousValue !== propValue) {
                toggleClasses(domNode, previousValue, false);
                toggleClasses(domNode, propValue, true);
            }
        }
        else if (propName === 'classes') {
            var classList = domNode.classList;
            var classNames = Object.keys(propValue);
            var classNameCount = classNames.length;
            for (var j = 0; j < classNameCount; j++) {
                var className = classNames[j];
                var on = !!propValue[className];
                var previousOn = !!previousValue[className];
                if (on === previousOn) {
                    continue;
                }
                propertiesUpdated = true;
                if (on) {
                    classList.add(className);
                }
                else {
                    classList.remove(className);
                }
            }
        }
        else if (propName === 'styles') {
            var styleNames = Object.keys(propValue);
            var styleCount = styleNames.length;
            for (var j = 0; j < styleCount; j++) {
                var styleName = styleNames[j];
                var newStyleValue = propValue[styleName];
                var oldStyleValue = previousValue[styleName];
                if (newStyleValue === oldStyleValue) {
                    continue;
                }
                propertiesUpdated = true;
                if (newStyleValue) {
                    checkStyleValue(newStyleValue);
                    projectionOptions.styleApplyer(domNode, styleName, newStyleValue);
                }
                else {
                    projectionOptions.styleApplyer(domNode, styleName, '');
                }
            }
        }
        else {
            if (!propValue && typeof previousValue === 'string') {
                propValue = '';
            }
            if (propName === 'value') { // value can be manipulated by the user directly and using event.preventDefault() is not an option
                var domValue = domNode[propName];
                if (domValue !== propValue // The 'value' in the DOM tree !== newValue
                    && (domNode['oninput-value']
                        ? domValue === domNode['oninput-value'] // If the last reported value to 'oninput' does not match domValue, do nothing and wait for oninput
                        : propValue !== previousValue // Only update the value if the vdom changed
                    )) {
                    // The edge cases are described in the tests
                    domNode[propName] = propValue; // Reset the value, even if the virtual DOM did not change
                    domNode['oninput-value'] = undefined;
                } // else do not update the domNode, otherwise the cursor position would be changed
                if (propValue !== previousValue) {
                    propertiesUpdated = true;
                }
            }
            else if (propValue !== previousValue) {
                var type = typeof propValue;
                if (type !== 'function' || !projectionOptions.eventHandlerInterceptor) { // Function updates are expected to be handled by the EventHandlerInterceptor
                    if (projectionOptions.namespace === NAMESPACE_SVG) {
                        if (propName === 'href') {
                            domNode.setAttributeNS(NAMESPACE_XLINK, propName, propValue);
                        }
                        else {
                            // all SVG attributes are read-only in DOM, so...
                            domNode.setAttribute(propName, propValue);
                        }
                    }
                    else if (type === 'string' && propName !== 'innerHTML') {
                        if (propName === 'role' && propValue === '') {
                            domNode.removeAttribute(propName);
                        }
                        else {
                            domNode.setAttribute(propName, propValue);
                        }
                    }
                    else if (domNode[propName] !== propValue) { // Comparison is here for side-effects in Edge with scrollLeft and scrollTop
                        domNode[propName] = propValue;
                    }
                    propertiesUpdated = true;
                }
            }
        }
    }
    return propertiesUpdated;
};
var updateChildren = function (vnode, domNode, oldChildren, newChildren, projectionOptions) {
    if (oldChildren === newChildren) {
        return false;
    }
    oldChildren = oldChildren || emptyArray;
    newChildren = newChildren || emptyArray;
    var oldChildrenLength = oldChildren.length;
    var newChildrenLength = newChildren.length;
    var oldIndex = 0;
    var newIndex = 0;
    var i;
    var textUpdated = false;
    while (newIndex < newChildrenLength) {
        var oldChild = (oldIndex < oldChildrenLength) ? oldChildren[oldIndex] : undefined;
        var newChild = newChildren[newIndex];
        if (oldChild !== undefined && same(oldChild, newChild)) {
            textUpdated = updateDom(oldChild, newChild, projectionOptions) || textUpdated;
            oldIndex++;
        }
        else {
            var findOldIndex = findIndexOfChild(oldChildren, newChild, oldIndex + 1);
            if (findOldIndex >= 0) {
                // Remove preceding missing children
                for (i = oldIndex; i < findOldIndex; i++) {
                    nodeToRemove(oldChildren[i]);
                    checkDistinguishable(oldChildren, i, vnode, 'removed');
                }
                textUpdated = updateDom(oldChildren[findOldIndex], newChild, projectionOptions) || textUpdated;
                oldIndex = findOldIndex + 1;
            }
            else {
                // New child
                createDom(newChild, domNode, (oldIndex < oldChildrenLength) ? oldChildren[oldIndex].domNode : undefined, projectionOptions);
                nodeAdded(newChild);
                checkDistinguishable(newChildren, newIndex, vnode, 'added');
            }
        }
        newIndex++;
    }
    if (oldChildrenLength > oldIndex) {
        // Remove child fragments
        for (i = oldIndex; i < oldChildrenLength; i++) {
            nodeToRemove(oldChildren[i]);
            checkDistinguishable(oldChildren, i, vnode, 'removed');
        }
    }
    return textUpdated;
};
updateDom = function (previous, vnode, projectionOptions) {
    var domNode = previous.domNode;
    var textUpdated = false;
    if (previous === vnode) {
        return false; // By contract, VNode objects may not be modified anymore after passing them to maquette
    }
    var updated = false;
    if (vnode.vnodeSelector === '') {
        if (vnode.text !== previous.text) {
            var newTextNode = domNode.ownerDocument.createTextNode(vnode.text);
            domNode.parentNode.replaceChild(newTextNode, domNode);
            vnode.domNode = newTextNode;
            textUpdated = true;
            return textUpdated;
        }
        vnode.domNode = domNode;
    }
    else {
        if (vnode.vnodeSelector.lastIndexOf('svg', 0) === 0) { // lastIndexOf(needle,0)===0 means StartsWith
            projectionOptions = extend(projectionOptions, { namespace: NAMESPACE_SVG });
        }
        if (previous.text !== vnode.text) {
            updated = true;
            if (vnode.text === undefined) {
                domNode.removeChild(domNode.firstChild); // the only textnode presumably
            }
            else {
                domNode.textContent = vnode.text;
            }
        }
        vnode.domNode = domNode;
        updated = updateChildren(vnode, domNode, previous.children, vnode.children, projectionOptions) || updated;
        updated = updateProperties(domNode, previous.properties, vnode.properties, projectionOptions) || updated;
        if (vnode.properties && vnode.properties.afterUpdate) {
            vnode.properties.afterUpdate.apply(vnode.properties.bind || vnode.properties, [domNode, projectionOptions, vnode.vnodeSelector, vnode.properties, vnode.children]);
        }
    }
    if (updated && vnode.properties && vnode.properties.updateAnimation) {
        vnode.properties.updateAnimation(domNode, vnode.properties, previous.properties);
    }
    return textUpdated;
};
var createProjection = function (vnode, projectionOptions) {
    return {
        getLastRender: function () { return vnode; },
        update: function (updatedVnode) {
            if (vnode.vnodeSelector !== updatedVnode.vnodeSelector) {
                throw new Error('The selector for the root VNode may not be changed. (consider using dom.merge and add one extra level to the virtual DOM)');
            }
            var previousVNode = vnode;
            vnode = updatedVnode;
            updateDom(previousVNode, updatedVnode, projectionOptions);
        },
        domNode: vnode.domNode
    };
};

var DEFAULT_PROJECTION_OPTIONS = {
    namespace: undefined,
    performanceLogger: function () { return undefined; },
    eventHandlerInterceptor: undefined,
    styleApplyer: function (domNode, styleName, value) {
        if (styleName.charAt(0) === '-') {
            // CSS variables must be set using setProperty
            domNode.style.setProperty(styleName, value);
        }
        else {
            // properties like 'backgroundColor' must be set as a js-property
            domNode.style[styleName] = value;
        }
    }
};
var applyDefaultProjectionOptions = function (projectorOptions) {
    return extend(DEFAULT_PROJECTION_OPTIONS, projectorOptions);
};
var dom = {
    /**
     * Creates a real DOM tree from `vnode`. The [[Projection]] object returned will contain the resulting DOM Node in
     * its [[Projection.domNode|domNode]] property.
     * This is a low-level method. Users will typically use a [[Projector]] instead.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection.
     * @returns The [[Projection]] which also contains the DOM Node that was created.
     */
    create: function (vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, document.createElement('div'), undefined, projectionOptions);
        return createProjection(vnode, projectionOptions);
    },
    /**
     * Appends a new child node to the DOM which is generated from a [[VNode]].
     * This is a low-level method. Users will typically use a [[Projector]] instead.
     * @param parentNode - The parent node for the new child node.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the [[Projection]].
     * @returns The [[Projection]] that was created.
     */
    append: function (parentNode, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, parentNode, undefined, projectionOptions);
        return createProjection(vnode, projectionOptions);
    },
    /**
     * Inserts a new DOM node which is generated from a [[VNode]].
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param beforeNode - The node that the DOM Node is inserted before.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function.
     * NOTE: [[VNode]] objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
     * @returns The [[Projection]] that was created.
     */
    insertBefore: function (beforeNode, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, beforeNode.parentNode, beforeNode, projectionOptions);
        return createProjection(vnode, projectionOptions);
    },
    /**
     * Merges a new DOM node which is generated from a [[VNode]] with an existing DOM Node.
     * This means that the virtual DOM and the real DOM will have one overlapping element.
     * Therefore the selector for the root [[VNode]] will be ignored, but its properties and children will be applied to the Element provided.
     * This is a low-level method. Users wil typically use a [[Projector]] instead.
     * @param element - The existing element to adopt as the root of the new virtual DOM. Existing attributes and child nodes are preserved.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]] objects
     * may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the projection, see [[createProjector]].
     * @returns The [[Projection]] that was created.
     */
    merge: function (element, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        vnode.domNode = element;
        initPropertiesAndChildren(element, vnode, projectionOptions);
        return createProjection(vnode, projectionOptions);
    },
    /**
     * Replaces an existing DOM node with a node generated from a [[VNode]].
     * This is a low-level method. Users will typically use a [[Projector]] instead.
     * @param element - The node for the [[VNode]] to replace.
     * @param vnode - The root of the virtual DOM tree that was created using the [[h]] function. NOTE: [[VNode]]
     * objects may only be rendered once.
     * @param projectionOptions - Options to be used to create and update the [[Projection]].
     * @returns The [[Projection]] that was created.
     */
    replace: function (element, vnode, projectionOptions) {
        projectionOptions = applyDefaultProjectionOptions(projectionOptions);
        createDom(vnode, element.parentNode, element, projectionOptions);
        element.parentNode.removeChild(element);
        return createProjection(vnode, projectionOptions);
    }
};

/* tslint:disable function-name */
var toTextVNode = function (data) {
    return {
        vnodeSelector: '',
        properties: undefined,
        children: undefined,
        text: data.toString(),
        domNode: null
    };
};
var appendChildren = function (parentSelector, insertions, main) {
    for (var i = 0, length_1 = insertions.length; i < length_1; i++) {
        var item = insertions[i];
        if (Array.isArray(item)) {
            appendChildren(parentSelector, item, main);
        }
        else {
            if (item !== null && item !== undefined && item !== false) {
                if (typeof item === 'string') {
                    item = toTextVNode(item);
                }
                main.push(item);
            }
        }
    }
};
function h(selector, properties, children) {
    if (Array.isArray(properties)) {
        children = properties;
        properties = undefined;
    }
    else if ((properties && (typeof properties === 'string' || properties.hasOwnProperty('vnodeSelector'))) ||
        (children && (typeof children === 'string' || children.hasOwnProperty('vnodeSelector')))) {
        throw new Error('h called with invalid arguments');
    }
    var text;
    var flattenedChildren;
    // Recognize a common special case where there is only a single text node
    if (children && children.length === 1 && typeof children[0] === 'string') {
        text = children[0];
    }
    else if (children) {
        flattenedChildren = [];
        appendChildren(selector, children, flattenedChildren);
        if (flattenedChildren.length === 0) {
            flattenedChildren = undefined;
        }
    }
    return {
        vnodeSelector: selector,
        properties: properties,
        children: flattenedChildren,
        text: (text === '') ? undefined : text,
        domNode: null
    };
}

var createParentNodePath = function (node, rootNode) {
    var parentNodePath = [];
    while (node && node !== rootNode) {
        parentNodePath.push(node);
        node = node.parentNode;
    }
    return parentNodePath;
};
var find;
if (Array.prototype.find) {
    find = function (items, predicate) { return items.find(predicate); };
}
else {
    find = function (items, predicate) { return items.filter(predicate)[0]; };
}
var findVNodeByParentNodePath = function (vnode, parentNodePath) {
    var result = vnode;
    parentNodePath.forEach(function (node) {
        result = (result && result.children) ? find(result.children, function (child) { return child.domNode === node; }) : undefined;
    });
    return result;
};
var createEventHandlerInterceptor = function (projector, getProjection, performanceLogger) {
    var modifiedEventHandler = function (evt) {
        performanceLogger('domEvent', evt);
        var projection = getProjection();
        var parentNodePath = createParentNodePath(evt.currentTarget, projection.domNode);
        parentNodePath.reverse();
        var matchingVNode = findVNodeByParentNodePath(projection.getLastRender(), parentNodePath);
        projector.scheduleRender();
        var result;
        if (matchingVNode) {
            /* tslint:disable no-invalid-this */
            result = matchingVNode.properties["on" + evt.type].apply(matchingVNode.properties.bind || this, arguments);
            /* tslint:enable no-invalid-this */
        }
        performanceLogger('domEventProcessed', evt);
        return result;
    };
    return function (propertyName, eventHandler, domNode, properties) { return modifiedEventHandler; };
};
/**
 * Creates a [[Projector]] instance using the provided projectionOptions.
 *
 * For more information, see [[Projector]].
 *
 * @param projectorOptions   Options that influence how the DOM is rendered and updated.
 */
var createProjector = function (projectorOptions) {
    var projector;
    var projectionOptions = applyDefaultProjectionOptions(projectorOptions);
    var performanceLogger = projectionOptions.performanceLogger;
    var renderCompleted = true;
    var scheduled;
    var stopped = false;
    var projections = [];
    var renderFunctions = []; // matches the projections array
    var addProjection = function (
    /* one of: dom.append, dom.insertBefore, dom.replace, dom.merge */
    domFunction, 
    /* the parameter of the domFunction */
    node, renderFunction) {
        var projection;
        var getProjection = function () { return projection; };
        projectionOptions.eventHandlerInterceptor = createEventHandlerInterceptor(projector, getProjection, performanceLogger);
        projection = domFunction(node, renderFunction(), projectionOptions);
        projections.push(projection);
        renderFunctions.push(renderFunction);
    };
    var doRender = function () {
        scheduled = undefined;
        if (!renderCompleted) {
            return; // The last render threw an error, it should have been logged in the browser console.
        }
        renderCompleted = false;
        performanceLogger('renderStart', undefined);
        for (var i = 0; i < projections.length; i++) {
            var updatedVnode = renderFunctions[i]();
            performanceLogger('rendered', undefined);
            projections[i].update(updatedVnode);
            performanceLogger('patched', undefined);
        }
        performanceLogger('renderDone', undefined);
        renderCompleted = true;
    };
    projector = {
        renderNow: doRender,
        scheduleRender: function () {
            if (!scheduled && !stopped) {
                scheduled = requestAnimationFrame(doRender);
            }
        },
        stop: function () {
            if (scheduled) {
                cancelAnimationFrame(scheduled);
                scheduled = undefined;
            }
            stopped = true;
        },
        resume: function () {
            stopped = false;
            renderCompleted = true;
            projector.scheduleRender();
        },
        append: function (parentNode, renderFunction) {
            addProjection(dom.append, parentNode, renderFunction);
        },
        insertBefore: function (beforeNode, renderFunction) {
            addProjection(dom.insertBefore, beforeNode, renderFunction);
        },
        merge: function (domNode, renderFunction) {
            addProjection(dom.merge, domNode, renderFunction);
        },
        replace: function (domNode, renderFunction) {
            addProjection(dom.replace, domNode, renderFunction);
        },
        detach: function (renderFunction) {
            for (var i = 0; i < renderFunctions.length; i++) {
                if (renderFunctions[i] === renderFunction) {
                    renderFunctions.splice(i, 1);
                    return projections.splice(i, 1)[0];
                }
            }
            throw new Error('renderFunction was not found');
        }
    };
    return projector;
};

class BaseComponent extends HTMLElement {
  constructor({ useShadowDom, shadowDomMode }) {
    super();

    if (useShadowDom) {
      this.shadow = this.attachShadow({ mode: shadowDomMode });
    }

    this.projector = createProjector();
  }

  connectedCallback() {
    this.projector.append(this.node, this.render.bind(this));
  }

  render() {
    return h("div", []);
  }

  get node() {
    return this.shadow || this;
  }
}

// Based on Responsive Header Template - https://www.tailwindtoolbox.com/templates/responsive-header
class NavigationComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.links = [
      { route: "/", label: "Dashboard" },
      { route: "/about", label: "About" },
    ];
  }

  get title() {
    return this.getAttribute("title") || "";
  }

  connectedCallback() {
    super.connectedCallback();

    this.node
      .querySelector(".nav-toggle")
      .addEventListener("click", this.toggle.bind(this));
  }

  toggle() {
    this.node.querySelector(".nav-content").classList.toggle("hidden");
  }

  render() {
    return h(
      "nav.flex.items-center.justify-between.flex-wrap.bg-gray-800.p-6.fixed.w-full.z-10.top-0",
      [
        h("div.flex.items-center.flex-shrink-0.text-white.mr-6", [
          h("a.text-white.no-underline.hover:text-white.hover:no-underline", [
            h("span.text-xl.pl-2", [this.title]),
          ]),
        ]),

        h("div.block.lg:hidden", [
          h(
            "button.nav-toggle.flex.items-center.px-3.py-2.border.rounded.text-gray-500.border-gray-600.hover:text-white.hover:border-white",
            [
              h(
                "svg.fill-current.h3.w3",
                {
                  viewBox: "0 0 20 20",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: 20,
                  height: 20,
                },
                [
                  h("title", ["Menu"]),
                  h("path", {
                    d: "M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z",
                  }),
                ]
              ),
            ]
          ),
        ]),

        h(
          "div.nav-content.w-full.flex-grow.lg:flex.lg:items-center.lg:w-auto.hidden.lg:block.pt-6.lg:pt-0",
          [
            h("ul.list-reset.lg:flex.justify-end.flex-1.items-center", [
              this.links.map((link, index) => {
                const className =
                  link.route === window.location.pathname
                    ? ".inline-block.py-2.px-4.text-white.no-underline"
                    : ".inline-block.text-gray-600.no-underline.hover:text-gray-200.hover:text-underline.py-2.px-4";

                return h("li.mr-3", { key: index }, [
                  h(`a${className}`, { href: link.route }, [link.label]),
                ]);
              }),
            ]),
          ]
        ),
      ]
    );
  }
}

customElements.define("ui-navigation", NavigationComponent);

class SliderComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.dragging = false;
  }

  get disabled() {
    return ["true", "1"].indexOf(this.getAttribute("disabled")) !== -1;
  }

  set disabled(val) {
    this.setAttribute("disabled", val);
    this.projector.renderNow();
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
  }

  get min() {
    return parseFloat(this.getAttribute("min") || 0);
  }

  set min(val) {
    this.setAttribute("min", val);
  }

  get max() {
    return parseFloat(this.getAttribute("max") || 1);
  }

  set max(val) {
    this.setAttribute("max", val);
  }

  get step() {
    return parseFloat(this.getAttribute("step") || 0.1);
  }

  set step(val) {
    this.setAttribute("step", val);
  }

  get value() {
    return parseFloat(this.getAttribute("value") || 0);
  }

  set value(val) {
    this.setAttribute("value", val);
    this.projector.renderNow();
    this.raiseChangeEvent();
  }

  get bead() {
    return this.node.querySelector("span.bead");
  }

  get fill() {
    return this.node.querySelector("span.fill");
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("mouseup", this.mouseUp.bind(this));
    document.addEventListener("mousemove", this.mouseMove.bind(this));
    this.node.addEventListener("click", this.mouseClick.bind(this));
    this.node.addEventListener("mousedown", this.mouseDown.bind(this));

    if (this.value < this.min) this.value = this.min;
    if (this.value > this.max) this.value = this.max;

    const box = this.getBoundingClientRect();
    const pos = this.scaleToElement();
    this.bead.style.left = this.fill.style.width =
      Math.max(0, pos - box.x) + "px";

    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
    this.resizeObserver.observe(document.body);
  }

  scaleToElement() {
    const box = this.getBoundingClientRect();
    const minBox = box.x;
    const maxBox = box.width + box.x;
    const res =
      ((this.value - this.min) / (this.max - this.min)) * (maxBox - minBox) +
      minBox;

    return res;
  }

  updateVisuals(e) {
    const box = this.getBoundingClientRect();
    const x = e.clientX;
    this.value = Math.round(this.scaleToRange(x) / this.step) * this.step;
    if (this.value < this.min) this.value = this.min;
    if (this.value > this.max) this.value = this.max;
    const pos = this.scaleToElement(this.value);
    this.bead.style.left = this.fill.style.width =
      Math.max(0, pos - box.x) + "px";
  }

  scaleToRange(pos) {
    const box = this.getBoundingClientRect();
    const minBox = box.x;
    const maxBox = box.width + box.x;
    const res =
      ((pos - minBox) / (maxBox - minBox)) * (this.max - this.min) + this.min;

    return res;
  }

  resize() {
    const box = this.getBoundingClientRect();
    const pos = this.scaleToElement();
    this.bead.style.left = this.fill.style.width =
      Math.max(0, pos - box.x) + "px";
  }

  getDisplayValue() {
    const isFloat = Number(this.value) === this.value && this.value % 1 !== 0;

    return (isFloat ? this.value.toFixed(2) : this.value).toString();
  }

  raiseChangeEvent() {
    const event = new CustomEvent("change", { detail: this.value });
    this.dispatchEvent(event);
  }

  pauseEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  mouseDown(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    this.dragging = true;
  }

  mouseUp(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    this.dragging = false;
  }

  mouseMove(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    if (!this.dragging) return;
    this.updateVisuals(e);
  }

  mouseClick(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    this.updateVisuals(e);
  }

  render() {
    return h("div.w-full", [
      h("div.bg-gray-400.h-2.w-full.rounded-full.relative", [
        h(
          `span.bead.bg-gray-100.h-4.w-4.absolute.top-0.-ml-2.-mt-1.z-10.shadow.rounded-full${
            this.disabled ? "" : ".cursor-pointer"
          }`
        ),
        h(
          `span.fill.bg-${
            this.disabled ? "gray" : "blue"
          }-500.h-2.absolute.left-0.top-0.rounded-full.w-0`
        ),
      ]),
      h("div.flex.justify-between.mt-2.text-xs.text-gray-600", [
        h("span.w-8.text-left", [this.min.toString()]),
        h(
          "span.w-8.text-center.text-lg.text-blue-500.font-bold.whitespace-no-wrap",
          [this.getDisplayValue()]
        ),
        h("span.w-8.text-right", [this.max.toString()]),
      ]),
    ]);
  }
}

customElements.define("ui-slider", SliderComponent);

class ToggleComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
    this.projector.renderNow();
  }

  get value() {
    const val = this.getAttribute("value");
    return val === "true" || val === "1";
  }

  set value(val) {
    this.setAttribute("value", val);
    this.projector.renderNow();
    this.raiseChangeEvent();
  }

  get disabled() {
    return ["true", "1"].indexOf(this.getAttribute("disabled")) !== -1;
  }

  set disabled(val) {
    this.setAttribute("disabled", val);
    this.projector.renderNow();
  }

  connectedCallback() {
    super.connectedCallback();

    this.checkbox = this.node.querySelector(
      'input[type="checkbox"].toggle-checkbox'
    );

    if (!this.disabled)
      this.checkbox.addEventListener("change", this.handleChange.bind(this));
  }

  handleChange(e) {
    e.stopPropagation();
    e.preventDefault();

    this.value = this.checkbox.checked;
  }

  raiseChangeEvent() {
    const event = new CustomEvent("change", { detail: this.value });
    this.dispatchEvent(event);
  }

  render() {
    return h(
      "div.select-none.relative.inline-block.w-10.mr-2.align-middle.transition.duration-200.ease-in",
      [
        h(
          "input.toggle-checkbox.outline-none.border-gray-400.absolute.block.w-6.h-6.rounded-full.bg-white.border-4.appearance-none.cursor-pointer",
          {
            type: "checkbox",
            checked: this.value,
            disabled: this.disabled,
          }
        ),
        h(
          "label.toggle-label.block.overflow-hidden.h-6.rounded-full.bg-gray-400.cursor-pointer"
        ),
      ]
    );
  }
}

customElements.define("ui-toggle", ToggleComponent);

class ConfirmComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });
  }

  get message() {
    return this.getAttribute("message");
  }

  set message(value) {
    this.setAttribute("message", value);
    this.projector.renderNow();
  }

  get modal() {
    return this.node.querySelector("div.modal");
  }

  get btnContinue() {
    return this.node.querySelector("button.btn-continue");
  }

  get btnCancel() {
    return this.node.querySelector("button.btn-cancel");
  }

  connectedCallback() {
    super.connectedCallback();

    this.btnCancel.addEventListener("click", () => {
      this.close();
      this.raiseChoiceEvent(false);
    });

    this.btnContinue.addEventListener("click", () => {
      this.close();
      this.raiseChoiceEvent(true);
    });
  }

  open() {
    this.modal.classList.remove("hidden");
  }

  close() {
    this.modal.classList.add("hidden");
  }

  raiseChoiceEvent(choice) {
    const event = new CustomEvent("choice", { detail: choice });
    this.dispatchEvent(event);
  }

  render() {
    return h(
      "div.modal.fixed.inset-0.z-10.bg-gray-500.bg-opacity-75.flex.justify-center.items-center.hidden",
      [
        h("div.bg-white.shadow-xl.sm:rounded.w-full.sm:w-3/4", [
          h("div.p-4", [
            h("div.flex.items-center", [
              h(
                "div.rounded-full.bg-red-100.h-10.w-10.flex.items-center.justify-center",
                [
                  h(
                    "i.fas.fa-exclamation-triangle.text-xl.opacity-75.text-red-500"
                  ),
                ]
              ),
              h("h3.ml-4.text-lg.leading-6.font-medium.text-gray-900", [
                "Delete device",
              ]),
            ]),
            h("p.ml-14.my-4", [this.message]),
          ]),
          h("div.p-4.rounded-b.bg-gray-100.text-right", [
            h(
              "button.btn-cancel.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-gray-400.hover:bg-gray-500.outline-none.focus:border-gray-900.font-semibold.text-sm",
              { type: "button" },
              ["Cancel"]
            ),
            h(
              "button.btn-continue.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold.text-sm",
              { type: "button" },
              ["Continue"]
            ),
          ]),
        ]),
      ]
    );
  }
}

customElements.define("ui-confirm", ConfirmComponent);

class DeviceListViewComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.devices = [];
    this.deviceTypes = [];
    this.deviceTypeSettings = [];
  }

  async connectedCallback() {
    const [devices, deviceTypes] = await Promise.all([
      this.fetchDevices(),
      this.fetchDeviceTypes(),
    ]);

    this.devices = devices.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.deviceTypes = deviceTypes.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.deviceTypeSettings = this.deviceTypes.reduce(
      (agg, cur) => agg.concat(cur.settings),
      []
    );

    super.connectedCallback();
  }

  async fetchDeviceTypes() {
    const res = await fetch("/api/device-types/");
    return await res.json();
  }

  async fetchDevices() {
    const res = await fetch("/api/devices/");
    return await res.json();
  }

  getDeviceTypeSettingLabel(deviceSetting) {
    const deviceTypeSetting = this.deviceTypeSettings.find(
      (d) => d.id === deviceSetting.deviceTypeSettingId
    );

    let value = "";

    switch (deviceTypeSetting.dataType) {
      case "Boolean":
        value = deviceSetting.value === "1";
        break;
      case "Number":
        const floatValue = parseFloat(deviceSetting.value);
        const isFloat =
          Number(floatValue) === floatValue && floatValue % 1 !== 0;
        value = isFloat ? floatValue.toFixed(2) : floatValue;
        break;
      default:
        value = deviceSetting.value;
        break;
    }

    return `${deviceTypeSetting.name}: ${value}`;
  }

  render() {
    return h("div.p-4", [
      h("div.flex.justify-between.items-center", [
        h("h1.font-bold.text-sm.uppercase.text-gray-700", ["Devices"]),
        h(
          "a.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold.text-sm",
          { href: "/devices/add" },
          ["Create"]
        ),
      ]),
      h("div.mt-4.shadow.bg-white.rounded", [
        this.devices.map((d) =>
          h(
            "div.w-full.border-gray-100.rounded-t.border-b.hover:bg-blue-100.text-gray-700",
            [
              h(
                "div.grid.grid-rows-2.grid-cols-2.gap-2.w-full.py-2.px-4.border-transparent.border-l-2.relative.hover:border-blue-100",
                [
                  h("h3.font-semibold.col-span-2", [d.name]),
                  h("span.text-sm.text-gray-500", [
                    d.settings
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map((d) => this.getDeviceTypeSettingLabel(d))
                      .join(" | "),
                  ]),
                  h("div.text-right", [
                    h(
                      "a.text-blue-500.hover:underline",
                      { href: `/devices/${d.id}` },
                      ["View"]
                    ),
                    " | ",
                    h(
                      "a.text-blue-500.hover:underline",
                      { href: `/devices/${d.id}/edit` },
                      ["Edit"]
                    ),
                  ]),
                ]
              ),
            ]
          )
        ),
      ]),
    ]);
  }
}

customElements.define("ui-device-list-view", DeviceListViewComponent);

class DeviceEditorComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.deviceTypes = [];
    this.device = null;

    this.infoViewDetails = {
      color: "red",
      icon: "",
      message: "",
    };

    this.eventListeners = new Map();
  }

  get deviceId() {
    return this.getAttribute("device-id") || null;
  }

  get deviceType() {
    return this.deviceTypes.find((d) => d.id === this.device.deviceTypeId);
  }

  get modal() {
    return this.node.querySelector("ui-confirm");
  }

  get mode() {
    return this.getAttribute("mode") || "view";
  }

  set mode(value) {
    const values = ["view", "edit", "create"];
    this.setAttribute(
      "mode",
      values.indexOf(value.toLowerCase()) !== -1 ? value.toLowerCase() : "view"
    );
    this.projector.renderNow();
  }

  get view() {
    return this.getAttribute("view") || "form";
  }

  set view(value) {
    const values = ["form", "info"];
    this.setAttribute(
      "view",
      values.indexOf(value.toLowerCase()) !== -1 ? value.toLowerCase() : "form"
    );
    this.projector.renderNow();
  }

  async connectedCallback() {
    const [device, deviceTypes] = await Promise.all([
      this.fetchDevice(),
      this.fetchDeviceTypes(),
    ]);

    this.device = device;
    this.deviceTypes = deviceTypes.sort((a, b) => (a.name > b.name ? 1 : -1));

    super.connectedCallback();
  }

  async fetchDeviceTypes() {
    const res = await fetch("/api/device-types/");

    if (res.status !== 200) {
      this.setInfoViewDetails(
        "red",
        "fa-times",
        "Device types could not be loaded"
      );
      this.view = "info";
      return [];
    }

    return await res.json();
  }

  async fetchDevice() {
    const emptyDevice = {
      id: null,
      deviceTypeId: null,
      name: "",
      settings: [],
    };
    if (!this.deviceId) return emptyDevice;

    const res = await fetch(`/api/devices/${this.deviceId}`);

    if (res.status !== 200) {
      this.setInfoViewDetails("red", "fa-times", "Device could not be found");
      this.view = "info";
      return emptyDevice;
    }

    return await res.json();
  }

  setInfoViewDetails(color, icon, message) {
    Object.assign(this.infoViewDetails, { color, icon, message });
  }

  handleDelete(e) {
    e.preventDefault();

    this.modal.message = `Are you sure you wish to delete this device?`;
    this.modal.open();
  }

  async handleDeleteChoice(e) {
    e.preventDefault();

    if (!e.detail) return;

    try {
      const res = await fetch(`/api/devices/${this.device.id}`, {
        method: "DELETE",
      });

      if (res.status !== 204)
        throw new Error(`Failed to delete: HTTP ${res.status}`);

      this.setInfoViewDetails("green", "fa-check", "Device was deleted");
      this.view = "info";
    } catch (err) {
      console.error(err);
      this.setInfoViewDetails("red", "fa-times", "Device could not be deleted");
      this.view = "info";
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    try {
      const settings = this.node.querySelector("div.settings");
      const createSettingValue = (el) => {
        const setting = {
          deviceId: this.device.id,
          deviceTypeSettingId: el.name,
          value: el.value,
        };

        return setting;
      };

      const settingValues = [
        ...settings.querySelectorAll(
          'input[type="text"],select,ui-slider,ui-toggle'
        ),
      ].map(createSettingValue);

      this.device.settings = settingValues;

      const res = await fetch(
        this.device.id ? `/api/devices/${this.device.id}` : "/api/devices",
        {
          method: this.device.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.device),
        }
      );

      await res.json();

      this.setInfoViewDetails("green", "fa-check", "Device saved successfully");
      this.view = "info";
    } catch (err) {
      console.error(err);
      this.setInfoViewDetails("red", "fa-times", "Device could not be saved");
      this.view = "info";
    }
  }

  handleNameChange(e) {
    e.preventDefault();

    this.device.name = e.target.value;
  }

  handleDeviceTypeChange(e) {
    e.preventDefault();

    const deviceTypeId = parseInt(e.target.value);
    this.device.deviceTypeId = deviceTypeId;

    this.projector.renderNow();
  }

  handleAfterCreate(el, eventName, handlerName) {
    this.eventListeners.set(handlerName, this[handlerName].bind(this));
    el.addEventListener(eventName, this.eventListeners.get(handlerName));
  }

  handleAfterRemoved(el, eventName, handlerName) {
    if (!this.eventListeners.has(handlerName)) return;
    el.removeEventListener(eventName, this.eventListeners.get(handlerName));
    this.eventListeners.delete(handlerName);
  }

  renderInfoView() {
    if (this.view !== "info") return null;

    return h("div.info-view", [
      h("div.flex.items-center", [
        h(
          `div.rounded-full.bg-${this.infoViewDetails.color}-100.h-10.w-10.flex.items-center.justify-center`,
          [
            h(
              `i.fas.${this.infoViewDetails.icon}.text-xl.opacity-75.text-${this.infoViewDetails.color}-500`
            ),
          ]
        ),
        h("h3.ml-4.text-lg.leading-6.font-medium.text-gray-900", [
          this.infoViewDetails.message,
        ]),
      ]),
      h("div.ml-14.my-4", [
        h(
          "a.btn-continue.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold",
          { href: "/" },
          ["Continue"]
        ),
      ]),
    ]);
  }

  renderFormHeader() {
    if (this.view !== "form") return null;

    let title = "";
    switch (this.mode) {
      case "edit":
        title = `Edit: ${this.device.name}`;
        break;
      case "create":
        title = `Create a device`;
        break;
      default:
        title = `View: ${this.device.name}`;
        break;
    }

    return h("div.flex.justify-between.items-center", [
      h(
        "h1.font-bold.text-sm.uppercase.text-gray-700.overflow-ellipsis.overflow-hidden.whitespace-nowrap",
        [title]
      ),
      h("div.text-right", [
        ["view", "edit"].indexOf(this.mode) !== -1
          ? h(
              "button.btn-delete.m-1.sm:m-0.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-gray-400.hover:bg-gray-500.outline-none.focus:border-gray-900.font-semibold.text-sm",
              {
                type: "button",
                afterCreate: (el) =>
                  this.handleAfterCreate(el, "click", "handleDelete"),
                afterRemoved: (el) =>
                  this.handleAfterRemoved(el, "click", "handleDelete"),
              },
              ["Delete"]
            )
          : null,
        ["create", "edit"].indexOf(this.mode) !== -1
          ? h(
              "button.btn-save.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold.text-sm",
              { type: "submit" },
              ["Save"]
            )
          : null,
      ]),
    ]);
  }

  renderBaseDeviceSettings() {
    if (this.view !== "form") return null;

    return [
      h("div.mb-4", [
        h("label.text-gray-700.mb-2.block", { for: "name" }, ["Name:"]),
        h(
          "input.bg-gray-100.appearance-none.border-2.border-gray-100.rounded.w-full.py-2.px-4.text-gray-700.leading-tight.focus:outline-none.focus:bg-white.focus:border-blue-500",
          {
            type: "text",
            name: "name",
            required: true,
            maxlength: 200,
            placeholder: "Enter a name",
            value: this.device.name,
            disabled: this.mode === "view",
            afterCreate: (el) =>
              this.handleAfterCreate(el, "keyup", "handleNameChange"),
            afterRemoved: (el) =>
              this.handleAfterRemoved(el, "keyup", "handleNameChange"),
          }
        ),
      ]),
      h("div.mb-4", [
        h("label.text-gray-700.mb-2.block", { for: "deviceTypeId" }, ["Type:"]),
        h(
          "select.ddl-type.bg-gray-100.appearance-none.border-2.border-gray-100.rounded.w-full.py-2.px-4.text-gray-700.leading-tight.focus:outline-none.focus:bg-white.focus:border-blue-500",
          {
            name: "deviceTypeId",
            required: true,
            value: this.device.deviceTypeId,
            disabled: ["view", "edit"].indexOf(this.mode) !== -1,
            afterCreate: (el) =>
              this.handleAfterCreate(el, "change", "handleDeviceTypeChange"),
            afterRemoved: (el) =>
              this.handleAfterRemoved(el, "change", "handleDeviceTypeChange"),
          },
          [
            h("option", { value: "" }, ["Select a device type"]),
            ...this.deviceTypes.map((type) => {
              return h("option", { value: type.id }, [type.name]);
            }),
          ]
        ),
      ]),
    ];
  }

  renderList(setting, deviceSetting) {
    if (setting.dataType !== "List") return null;

    return h("div.mb-4", { key: setting.id }, [
      h("label.text-gray-700.mb-2.block", { for: setting.id }, [
        `${setting.name}:`,
      ]),
      h(
        "select.bg-gray-100.appearance-none.border-2.border-gray-100.rounded.w-full.py-2.px-4.text-gray-700.leading-tight.focus:outline-none.focus:bg-white.focus:border-blue-500",
        {
          type: "text",
          name: setting.id,
          required: setting.required,
          value: deviceSetting ? deviceSetting.value : null,
          disabled: this.mode === "view",
        },
        setting.options
          .sort((a, b) => (a.text > b.text ? 1 : -1))
          .map((opt) => {
            return h("option", { value: opt.value }, [opt.text]);
          })
      ),
    ]);
  }

  renderTextbox(setting, deviceSetting) {
    if (setting.dataType !== "String") return null;

    return h("div.mb-4", { key: setting.id }, [
      h("label.text-gray-700.mb-2.block", { for: setting.id }, [
        `${setting.name}:`,
      ]),
      h("input", {
        type: "text",
        name: setting.id,
        required: setting.required,
        maxlength: 200,
        value: deviceSetting ? deviceSetting.value : null,
        disabled: this.mode === "view",
      }),
    ]);
  }

  renderRange(setting, deviceSetting) {
    if (setting.dataType !== "Number") return null;

    return h("div.mb-4", { key: setting.id }, [
      h("label.text-gray-700.mb-2.block", { for: setting.id }, [
        `${setting.name}:`,
      ]),
      h("ui-slider", {
        name: setting.id,
        min: setting.min,
        max: setting.max,
        step: setting.step,
        value: deviceSetting ? deviceSetting.value : null,
        disabled: this.mode === "view",
      }),
    ]);
  }

  renderCheckbox(setting, deviceSetting) {
    if (setting.dataType !== "Boolean") return null;

    return h("div.mb-4", { key: setting.id }, [
      h(
        "label.text-gray-700.inline-flex.items-center.mt-3",
        { for: setting.id },
        [
          h("ui-toggle", {
            name: setting.id,
            value: deviceSetting ? deviceSetting.value : null,
            disabled: this.mode === "view",
          }),
          h("span.ml-2.text-gray-700", [setting.name]),
        ]
      ),
    ]);
  }

  renderSettings() {
    if (!this.deviceType) return null;

    return h("div.settings.pt-4.border-t", [
      h("h3.font-bold.text-sm.uppercase.text-gray-700", ["Settings"]),
      ...this.deviceType.settings
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map((d) => {
          const deviceSetting = (this.device ? this.device.settings : []).find(
            (x) => x.deviceTypeSettingId === d.id
          );
          return (
            this.renderCheckbox(d, deviceSetting) ||
            this.renderTextbox(d, deviceSetting) ||
            this.renderRange(d, deviceSetting) ||
            this.renderList(d, deviceSetting)
          );
        }),
    ]);
  }

  renderFormView() {
    if (this.view !== "form") return null;

    return h(
      "form",
      {
        afterCreate: (el) =>
          this.handleAfterCreate(el, "submit", "handleFormSubmit"),
        afterRemoved: (el) =>
          this.handleAfterRemoved(el, "submit", "handleFormSubmit"),
      },
      [
        this.renderFormHeader(),
        ...this.renderBaseDeviceSettings(),
        this.renderSettings(),
      ]
    );
  }

  render() {
    return h("div.p-4", [
      this.renderInfoView(),
      this.renderFormView(),
      h("ui-confirm", {
        afterCreate: (el) =>
          this.handleAfterCreate(el, "choice", "handleDeleteChoice"),
        afterRemoved: (el) =>
          this.handleAfterCreate(el, "choice", "handleDeleteChoice"),
      }),
    ]);
  }
}

customElements.define("ui-device-editor", DeviceEditorComponent);
//# sourceMappingURL=index.esm.js.map
