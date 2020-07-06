
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const modalStates = writable({
        fragmentModalVisibility: false,
        modifierModalVisibility: false,
        editFragmentModalVisibility: false
    });

    const routineState = writable({
        type: "",
        name: "",
        country: "",
        competition: "",
        date: "",
        mark: "0.0",
        duration: "00:00",
        fragments: [],
        unique_modifiers: []
    });

    const fragmentState = writable({
        type: "",
        startTime: null,
        endTime: null,
        duration: null,
        basicMark: 0,
        //ONLY FOR HYBRIDS
        level: null,
        numberOfMovements: null,
        legs: null,
        //ONLY FOR PAIR ACROBATICS
        direction: null,
        support: null,
        rotations: null,
        //Difficulty calculates WITH basicMark
        difficulty: 0,
        modifiers: []
    });

    const calculateHybridLevel = function(fragment){
        return Number(fragment.duration) < 16 ? (Number(fragment.duration) < 10 ? 'short' : 'medium') : 'long';
    };
    const calculateFragmentDuration = function(fragment){
        if(fragment.startTime && fragment.endTime) {
            const startTimeInSeconds = Number(fragment.startTime.split(':')[0]) * 60 + Number(fragment.startTime.split(':')[1]);
            const endTimeInSeconds = Number(fragment.endTime.split(':')[0]) * 60 + Number(fragment.endTime.split(':')[1]);
            return endTimeInSeconds - startTimeInSeconds;
        }
    };

    const calculateFragmentBasicMark = function(fragment){
        if(fragment.type === 'transition'){
            return 0.1;
        } else if (fragment.type === 'hybrid'){
            let legs = fragment.legs;
            return legs==="1"?0.2:0.3;
        } else if (fragment.type === 'pair acrobatics'){
            let direction = fragment.direction;
            let rotations = fragment.rotations;
            let support = fragment.support;
            return Number(support+direction+rotations * 0.1).toFixed(2);
        }
    };

    const calculateFragmentDifficulty = function (fragment,programType) {
        let modifiersArray = fragment.modifiers.filter(item=>{
            return !item.unique
        });
        let uniqueModifiersArray = Array.from(new Set(fragment.modifiers.filter(item=>{
            return item.unique && !item.multiplier
        })));
        let multipliers = fragment.modifiers.filter(item=>{
            return item.multiplier
        });

        let modifiersMark = modifiersArray.reduce((accumulator,currentValue)=>{
            return accumulator+=currentValue.values[programType];
        }, 0);
        let uniqueModifiersMark = uniqueModifiersArray.reduce((accumulator,currentValue)=>{
            return accumulator+=currentValue.values[programType];
        }, 0);

        let mark = Number(fragment.basicMark) + Number(modifiersMark) + Number(uniqueModifiersMark);
        if(multipliers.length !== 0){
            let multipliersArray = multipliers.map((item)=>item.values[programType]);
            for(let multiplier of multipliersArray){
                mark*=multiplier;
            }
        }

        return Number(mark).toFixed(2)
    };

    const calculateRoutineDifficulty = function (routine) {
        let overallDifficulty = Number(routine.hybridsScore);
        if(routine.fragments.length !== 0 ) {
            routine.fragments.forEach((fragment) => {
                overallDifficulty += Number(fragment.difficulty);
            }, 0);
            if (routine.fragments[routine.fragments.length - 1].type === 'hybrid') {
                overallDifficulty += Number(routine.fragments[routine.fragments.length - 1].level === "short" ?
                    (routine.fragments[routine.fragments.length - 1].level === "long" ? 0.3 : 0.2) : 0.1);
            }
        }
        if(routine.unique_modifiers.length !== 0){
            routine.unique_modifiers.forEach((item)=>{
                overallDifficulty += item.values[routine.type];
            });
        }

        return Number(overallDifficulty).toFixed(2)
    };

    const calculateRoutineTime = function (program) {
        let overallTime = program.fragments.reduce((accumulator,fragment)=>{
            return accumulator+=Number(fragment.duration);
        },0);
        let seconds = String(overallTime % 60).padStart(2,'0');
        let minutes = String(Math.floor(overallTime/60)).padStart(2,'0');
        return `${minutes}:${seconds}`
    };

    const calculateHybridTime = function(program){
        let overallTime = program.fragments.reduce((accumulator,fragment)=>{
            return accumulator+=Number(fragment.duration);
        },0);

        let hybrids = program.fragments.filter((item)=>item.type === "hybrid");

        console.log(hybrids);

        let hybridsSeconds = hybrids.reduce((accumulator,fragment)=>{
            return accumulator+=Number(fragment.duration);
        },0);

        let seconds = String(hybridsSeconds % 60).padStart(2,'0');
        let minutes = String(Math.floor(hybridsSeconds/60)).padStart(2,'0');
        let hybridsTime = `${minutes}:${seconds}`;

        let hybridsPercent = hybridsSeconds/overallTime;

        let hybridsScore = hybridsPercent*5;

        return {hybridsTime, hybridsPercent, hybridsScore};
    };

    const hideModifierModal = function () {
        modalStates.update(state => {
            state.modifierModalVisibility = false;
            return state;
        });
    };

    const showModifierModal = function () {
        window.scroll(0,0);
        modalStates.update(state => {
            state.modifierModalVisibility = true;
            return state;
        });
    };

    const hideFragmentModal = function () {
        modalStates.update(state => {
            state.fragmentModalVisibility = false;
            return state;
        });
    };

    const showFragmentModal = function () {
        window.scroll(0,0);
        modalStates.update(state => {
            state.fragmentModalVisibility = true;
            console.log(state);
            return state;
        });
    };

    const showEditFragmentModal = function(){
        window.scroll(0,0);
        modalStates.update(state => {
            state.editFragmentModalVisibility = true;
            console.log(state);
            return state;
        });
    };


    const hideEditFragmentModal = function(){
        modalStates.update(state => {
            state.editFragmentModalVisibility = false;
            console.log(state);
            return state;
        });
    };

    /* src\Modal.svelte generated by Svelte v3.23.2 */
    const file = "src\\Modal.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_body_slot_changes = dirty => ({});
    const get_body_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let hr0;
    	let t2;
    	let t3;
    	let hr1;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*$$slots*/ ctx[4].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[3], get_header_slot_context);
    	const body_slot_template = /*$$slots*/ ctx[4].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[3], get_body_slot_context);
    	const footer_slot_template = /*$$slots*/ ctx[4].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[3], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (header_slot) header_slot.c();
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			if (body_slot) body_slot.c();
    			t3 = space();
    			hr1 = element("hr");
    			t4 = space();
    			if (footer_slot) footer_slot.c();
    			attr_dev(div0, "class", "modal-background svelte-7scno5");
    			add_location(div0, file, 43, 0, 1152);
    			add_location(hr0, file, 47, 4, 1322);
    			add_location(hr1, file, 49, 4, 1357);
    			attr_dev(div1, "class", "modal svelte-7scno5");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			set_style(div1, "--z_index", /*z_index*/ ctx[0]);
    			add_location(div1, file, 45, 0, 1192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (header_slot) {
    				header_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, hr0);
    			append_dev(div1, t2);

    			if (body_slot) {
    				body_slot.m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, hr1);
    			append_dev(div1, t4);

    			if (footer_slot) {
    				footer_slot.m(div1, null);
    			}

    			/*div1_binding*/ ctx[5](div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handle_keydown*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (body_slot) {
    				if (body_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(body_slot, body_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_body_slot_changes, get_body_slot_context);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			}

    			if (!current || dirty & /*z_index*/ 1) {
    				set_style(div1, "--z_index", /*z_index*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(body_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(body_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (header_slot) header_slot.d(detaching);
    			if (body_slot) body_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    			/*div1_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { z_index = 1 } = $$props;
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	let modal;

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}

    		if (e.key === "Tab") {
    			// trap focus
    			const nodes = modal.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	const writable_props = ["z_index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['header','body','footer']);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal = $$value;
    			$$invalidate(1, modal);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("z_index" in $$props) $$invalidate(0, z_index = $$props.z_index);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		onDestroy,
    		getContext,
    		z_index,
    		dispatch,
    		close,
    		modal,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ("z_index" in $$props) $$invalidate(0, z_index = $$props.z_index);
    		if ("modal" in $$props) $$invalidate(1, modal = $$props.modal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [z_index, modal, handle_keydown, $$scope, $$slots, div1_binding];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { z_index: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get z_index() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set z_index(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Modifier.svelte generated by Svelte v3.23.2 */

    const file$1 = "src\\Modifier.svelte";
    const get_footer_slot_changes$1 = dirty => ({});
    const get_footer_slot_context$1 = ctx => ({});
    const get_body_slot_changes$1 = dirty => ({});
    const get_body_slot_context$1 = ctx => ({});
    const get_header_slot_changes$1 = dirty => ({});
    const get_header_slot_context$1 = ctx => ({});

    function create_fragment$1(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*$$slots*/ ctx[1].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[0], get_header_slot_context$1);
    	const body_slot_template = /*$$slots*/ ctx[1].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[0], get_body_slot_context$1);
    	const footer_slot_template = /*$$slots*/ ctx[1].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[0], get_footer_slot_context$1);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div1 = element("div");
    			if (body_slot) body_slot.c();
    			t1 = space();
    			div2 = element("div");
    			if (footer_slot) footer_slot.c();
    			attr_dev(div0, "class", "header svelte-slr0h");
    			add_location(div0, file$1, 4, 4, 60);
    			attr_dev(div1, "class", "body svelte-slr0h");
    			add_location(div1, file$1, 7, 4, 130);
    			attr_dev(div2, "class", "footer svelte-slr0h");
    			add_location(div2, file$1, 10, 4, 196);
    			attr_dev(div3, "class", "modifier svelte-slr0h");
    			add_location(div3, file$1, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			if (header_slot) {
    				header_slot.m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div1);

    			if (body_slot) {
    				body_slot.m(div1, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			if (footer_slot) {
    				footer_slot.m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_header_slot_changes$1, get_header_slot_context$1);
    				}
    			}

    			if (body_slot) {
    				if (body_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(body_slot, body_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_body_slot_changes$1, get_body_slot_context$1);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_footer_slot_changes$1, get_footer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(body_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(body_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (header_slot) header_slot.d(detaching);
    			if (body_slot) body_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modifier> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modifier", $$slots, ['header','body','footer']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots, click_handler];
    }

    class Modifier extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modifier",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\FragmentModal.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$2 = "src\\FragmentModal.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (200:4) <div slot="header">
    function create_header_slot_1(ctx) {
    	let div0;
    	let div1;
    	let h2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "New Fragment";
    			add_location(h2, file$2, 201, 12, 9004);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$2, 200, 8, 8973);
    			attr_dev(div0, "slot", "header");
    			add_location(div0, file$2, 199, 4, 8944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    			append_dev(div1, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot_1.name,
    		type: "slot",
    		source: "(200:4) <div slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (225:12) {#if $fragmentState.type === "pair acrobatics"}
    function create_if_block_1(ctx) {
    	let label0;
    	let t0;
    	let select0;
    	let option0;
    	let option1;
    	let option1_value_value;
    	let option2;
    	let option2_value_value;
    	let t4;
    	let label1;
    	let t5;
    	let select1;
    	let option3;
    	let option4;
    	let option4_value_value;
    	let option5;
    	let option5_value_value;
    	let t9;
    	let label2;
    	let t10;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			t0 = text("Direction\r\n                    ");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			option1 = element("option");
    			option1.textContent = "Heads up";
    			option2 = element("option");
    			option2.textContent = "Legs up";
    			t4 = space();
    			label1 = element("label");
    			t5 = text("Support type\r\n                    ");
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "Choose...";
    			option4 = element("option");
    			option4.textContent = "Lift";
    			option5 = element("option");
    			option5.textContent = "Throw";
    			t9 = space();
    			label2 = element("label");
    			t10 = text("360° Rotations\r\n                    ");
    			input = element("input");
    			option0.selected = "selected";
    			option0.disabled = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 228, 24, 10471);
    			option1.__value = option1_value_value = 0.1;
    			option1.value = option1.__value;
    			add_location(option1, file$2, 229, 24, 10558);
    			option2.__value = option2_value_value = 0.2;
    			option2.value = option2.__value;
    			add_location(option2, file$2, 230, 24, 10623);
    			select0.required = true;
    			attr_dev(select0, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[9].direction === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[20].call(select0));
    			add_location(select0, file$2, 226, 20, 10312);
    			add_location(label0, file$2, 225, 16, 10274);
    			option3.selected = "selected";
    			option3.disabled = true;
    			option3.__value = "";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 236, 24, 10905);
    			option4.__value = option4_value_value = 0;
    			option4.value = option4.__value;
    			add_location(option4, file$2, 237, 24, 10992);
    			option5.__value = option5_value_value = 0.1;
    			option5.value = option5.__value;
    			add_location(option5, file$2, 238, 24, 11051);
    			select1.required = true;
    			attr_dev(select1, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[9].support === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[22].call(select1));
    			add_location(select1, file$2, 235, 20, 10779);
    			add_location(label1, file$2, 234, 16, 10738);
    			input.required = true;
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$2, 243, 20, 11207);
    			add_location(label2, file$2, 242, 16, 11164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t0);
    			append_dev(label0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			/*select0_binding*/ ctx[19](select0);
    			select_option(select0, /*$fragmentState*/ ctx[9].direction);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t5);
    			append_dev(label1, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			/*select1_binding*/ ctx[21](select1);
    			select_option(select1, /*$fragmentState*/ ctx[9].support);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, t10);
    			append_dev(label2, input);
    			/*input_binding*/ ctx[23](input);
    			set_input_value(input, /*$fragmentState*/ ctx[9].rotations);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[20]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[22]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[24])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 512) {
    				select_option(select0, /*$fragmentState*/ ctx[9].direction);
    			}

    			if (dirty[0] & /*$fragmentState*/ 512) {
    				select_option(select1, /*$fragmentState*/ ctx[9].support);
    			}

    			if (dirty[0] & /*$fragmentState*/ 512 && to_number(input.value) !== /*$fragmentState*/ ctx[9].rotations) {
    				set_input_value(input, /*$fragmentState*/ ctx[9].rotations);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			/*select0_binding*/ ctx[19](null);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(label1);
    			/*select1_binding*/ ctx[21](null);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(label2);
    			/*input_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(225:12) {#if $fragmentState.type === \\\"pair acrobatics\\\"}",
    		ctx
    	});

    	return block;
    }

    // (249:12) {#if $fragmentState.type === "hybrid"}
    function create_if_block(ctx) {
    	let label0;
    	let t0;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t6;
    	let label1;
    	let t7;
    	let select1;
    	let option5;
    	let option6;
    	let option7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			t0 = text("Number of Movements\r\n                    ");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			option1 = element("option");
    			option1.textContent = "<6";
    			option2 = element("option");
    			option2.textContent = "6-20";
    			option3 = element("option");
    			option3.textContent = "21-30";
    			option4 = element("option");
    			option4.textContent = ">30";
    			t6 = space();
    			label1 = element("label");
    			t7 = text("Legs\r\n                    ");
    			select1 = element("select");
    			option5 = element("option");
    			option5.textContent = "Choose...";
    			option6 = element("option");
    			option6.textContent = "One leg (raising or lifting)";
    			option7 = element("option");
    			option7.textContent = "Two legs (raising or lifting)";
    			option0.selected = "selected";
    			option0.disabled = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 252, 24, 11717);
    			option1.__value = "<6";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 253, 24, 11804);
    			option2.__value = "6-20";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 254, 24, 11863);
    			option3.__value = "21-30";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 255, 24, 11923);
    			option4.__value = ">30";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 256, 24, 11985);
    			select0.required = true;
    			attr_dev(select0, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[9].numberOfMovements === void 0) add_render_callback(() => /*select0_change_handler_1*/ ctx[26].call(select0));
    			add_location(select0, file$2, 250, 20, 11550);
    			add_location(label0, file$2, 249, 16, 11502);
    			option5.selected = "selected";
    			option5.disabled = true;
    			option5.__value = "";
    			option5.value = option5.__value;
    			add_location(option5, file$2, 261, 24, 12250);
    			option6.__value = "1";
    			option6.value = option6.__value;
    			add_location(option6, file$2, 262, 24, 12337);
    			option7.__value = "2";
    			option7.value = option7.__value;
    			add_location(option7, file$2, 263, 24, 12418);
    			select1.required = true;
    			attr_dev(select1, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[9].legs === void 0) add_render_callback(() => /*select1_change_handler_1*/ ctx[28].call(select1));
    			add_location(select1, file$2, 260, 20, 12130);
    			add_location(label1, file$2, 259, 16, 12097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t0);
    			append_dev(label0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			/*select0_binding_1*/ ctx[25](select0);
    			select_option(select0, /*$fragmentState*/ ctx[9].numberOfMovements);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t7);
    			append_dev(label1, select1);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			/*select1_binding_1*/ ctx[27](select1);
    			select_option(select1, /*$fragmentState*/ ctx[9].legs);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler_1*/ ctx[26]),
    					listen_dev(select1, "change", /*select1_change_handler_1*/ ctx[28])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 512) {
    				select_option(select0, /*$fragmentState*/ ctx[9].numberOfMovements);
    			}

    			if (dirty[0] & /*$fragmentState*/ 512) {
    				select_option(select1, /*$fragmentState*/ ctx[9].legs);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			/*select0_binding_1*/ ctx[25](null);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(label1);
    			/*select1_binding_1*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(249:12) {#if $fragmentState.type === \\\"hybrid\\\"}",
    		ctx
    	});

    	return block;
    }

    // (286:12) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Additional movements will be here.\r\n                ";
    			add_location(div, file$2, 286, 16, 13401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(286:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (273:20) <div slot="header" >
    function create_header_slot(ctx) {
    	let div;
    	let t_value = /*modifier*/ ctx[35]["category"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "header");
    			add_location(div, file$2, 272, 20, 12818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 512 && t_value !== (t_value = /*modifier*/ ctx[35]["category"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(273:20) <div slot=\\\"header\\\" >",
    		ctx
    	});

    	return block;
    }

    // (276:20) <div slot="body" >
    function create_body_slot_1(ctx) {
    	let div;
    	let t_value = /*modifier*/ ctx[35].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "body");
    			add_location(div, file$2, 275, 20, 12936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 512 && t_value !== (t_value = /*modifier*/ ctx[35].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot_1.name,
    		type: "slot",
    		source: "(276:20) <div slot=\\\"body\\\" >",
    		ctx
    	});

    	return block;
    }

    // (282:20) <div class="close-button" slot="footer" on:click={()=>removeModifier(modifier)}>
    function create_footer_slot_1(ctx) {
    	let div0;
    	let t0;
    	let t1_value = /*modifier*/ ctx[35]["values"][/*$routineState*/ ctx[8].type] + "";
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[29](/*modifier*/ ctx[35], ...args);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Score: ");
    			t1 = text(t1_value);
    			div1 = element("div");
    			div1.textContent = "×";
    			attr_dev(div0, "slot", "footer");
    			add_location(div0, file$2, 278, 20, 13045);
    			attr_dev(div1, "class", "close-button");
    			attr_dev(div1, "slot", "footer");
    			add_location(div1, file$2, 281, 20, 13192);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$fragmentState, $routineState*/ 768 && t1_value !== (t1_value = /*modifier*/ ctx[35]["values"][/*$routineState*/ ctx[8].type] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot_1.name,
    		type: "slot",
    		source: "(282:20) <div class=\\\"close-button\\\" slot=\\\"footer\\\" on:click={()=>removeModifier(modifier)}>",
    		ctx
    	});

    	return block;
    }

    // (272:16) <Modifier>
    function create_default_slot_1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(272:16) <Modifier>",
    		ctx
    	});

    	return block;
    }

    // (271:12) {#each $fragmentState.modifiers as modifier}
    function create_each_block(ctx) {
    	let modifier;
    	let current;

    	modifier = new Modifier({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1],
    					footer: [create_footer_slot_1],
    					body: [create_body_slot_1],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modifier.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modifier, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modifier_changes = {};

    			if (dirty[0] & /*$fragmentState, $routineState*/ 768 | dirty[1] & /*$$scope*/ 128) {
    				modifier_changes.$$scope = { dirty, ctx };
    			}

    			modifier.$set(modifier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modifier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modifier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modifier, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(271:12) {#each $fragmentState.modifiers as modifier}",
    		ctx
    	});

    	return block;
    }

    // (205:4) <div slot="body" class="container">
    function create_body_slot(ctx) {
    	let div0;
    	let div2;
    	let label0;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input0;
    	let t7;
    	let label2;
    	let t9;
    	let input1;
    	let t10;
    	let t11;
    	let t12;
    	let button;
    	let t14;
    	let div3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$fragmentState*/ ctx[9].type === "pair acrobatics" && create_if_block_1(ctx);
    	let if_block1 = /*$fragmentState*/ ctx[9].type === "hybrid" && create_if_block(ctx);
    	let each_value = /*$fragmentState*/ ctx[9].modifiers;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			t0 = text("Type\r\n                ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			option1 = element("option");
    			option1.textContent = "Hybrid";
    			option2 = element("option");
    			option2.textContent = "Transition";
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Start time";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			label2 = element("label");
    			label2.textContent = "End time";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			button = element("button");
    			button.textContent = "Add additional movement";
    			t14 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			option0.selected = "selected";
    			option0.disabled = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 209, 20, 9306);
    			option1.__value = "hybrid";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 210, 20, 9392);
    			option2.__value = "transition";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 211, 20, 9452);
    			select.required = true;
    			attr_dev(select, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[9].type === void 0) add_render_callback(() => /*select_change_handler*/ ctx[14].call(select));
    			add_location(select, file$2, 207, 16, 9165);
    			add_location(label0, file$2, 206, 12, 9136);
    			attr_dev(label1, "for", "startTime");
    			add_location(label1, file$2, 215, 16, 9627);
    			attr_dev(input0, "id", "startTime");
    			input0.required = true;
    			attr_dev(input0, "pattern", "[0-9]:[0-9][0-9]");
    			attr_dev(input0, "placeholder", "0:00");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$2, 216, 16, 9686);
    			attr_dev(label2, "for", "endTime");
    			add_location(label2, file$2, 219, 16, 9915);
    			attr_dev(input1, "id", "endTime");
    			input1.required = true;
    			attr_dev(input1, "pattern", "[0-9]:[0-9][0-9]");
    			attr_dev(input1, "placeholder", "0:00");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$2, 220, 16, 9970);
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "row");
    			add_location(div1, file$2, 214, 12, 9561);
    			attr_dev(button, "class", "btn btn-outline-primary svelte-1mi4i04");
    			add_location(button, file$2, 267, 12, 12564);
    			attr_dev(div2, "class", "form");
    			add_location(div2, file$2, 205, 8, 9104);
    			attr_dev(div3, "class", "modifiers svelte-1mi4i04");
    			add_location(div3, file$2, 269, 8, 12687);
    			attr_dev(div0, "slot", "body");
    			attr_dev(div0, "class", "container svelte-1mi4i04");
    			add_location(div0, file$2, 204, 4, 9059);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div2);
    			append_dev(div2, label0);
    			append_dev(label0, t0);
    			append_dev(label0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			/*select_binding*/ ctx[13](select);
    			select_option(select, /*$fragmentState*/ ctx[9].type);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input0);
    			/*input0_binding*/ ctx[15](input0);
    			set_input_value(input0, /*$fragmentState*/ ctx[9].startTime);
    			append_dev(div1, t7);
    			append_dev(div1, label2);
    			append_dev(div1, t9);
    			append_dev(div1, input1);
    			/*input1_binding*/ ctx[17](input1);
    			set_input_value(input1, /*$fragmentState*/ ctx[9].endTime);
    			append_dev(div2, t10);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t11);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t12);
    			append_dev(div2, button);
    			append_dev(div0, t14);
    			append_dev(div0, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[14]),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen_dev(button, "click", /*addModifier*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 512) {
    				select_option(select, /*$fragmentState*/ ctx[9].type);
    			}

    			if (dirty[0] & /*$fragmentState*/ 512 && input0.value !== /*$fragmentState*/ ctx[9].startTime) {
    				set_input_value(input0, /*$fragmentState*/ ctx[9].startTime);
    			}

    			if (dirty[0] & /*$fragmentState*/ 512 && input1.value !== /*$fragmentState*/ ctx[9].endTime) {
    				set_input_value(input1, /*$fragmentState*/ ctx[9].endTime);
    			}

    			if (/*$fragmentState*/ ctx[9].type === "pair acrobatics") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div2, t11);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$fragmentState*/ ctx[9].type === "hybrid") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div2, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*removeModifier, $fragmentState, $routineState*/ 4864) {
    				each_value = /*$fragmentState*/ ctx[9].modifiers;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div3, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*select_binding*/ ctx[13](null);
    			/*input0_binding*/ ctx[15](null);
    			/*input1_binding*/ ctx[17](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot.name,
    		type: "slot",
    		source: "(205:4) <div slot=\\\"body\\\" class=\\\"container\\\">",
    		ctx
    	});

    	return block;
    }

    // (293:4) <div slot="footer" class="footer">
    function create_footer_slot(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Save";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Dismiss";
    			attr_dev(button0, "class", "btn btn-primary svelte-1mi4i04");
    			add_location(button0, file$2, 293, 8, 13585);
    			attr_dev(button1, "class", "btn btn-danger svelte-1mi4i04");
    			add_location(button1, file$2, 294, 8, 13666);
    			attr_dev(div, "slot", "footer");
    			attr_dev(div, "class", "footer svelte-1mi4i04");
    			add_location(div, file$2, 292, 4, 13541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveFragment*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", hideFragmentModal, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(293:4) <div slot=\\\"footer\\\" class=\\\"footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (199:0) <Modal on:close="{hideFragmentModal}" z_index=1>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(199:0) <Modal on:close=\\\"{hideFragmentModal}\\\" z_index=1>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				z_index: "1",
    				$$slots: {
    					default: [create_default_slot],
    					footer: [create_footer_slot],
    					body: [create_body_slot],
    					header: [create_header_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", hideFragmentModal);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*$fragmentState, $routineState, inputLegs, inputMovements, inputRotations, inputSupport, inputDirection, inputEndTime, inputStartTime, inputType*/ 1023 | dirty[1] & /*$$scope*/ 128) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $routineState;
    	let $fragmentState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(8, $routineState = $$value));
    	validate_store(fragmentState, "fragmentState");
    	component_subscribe($$self, fragmentState, $$value => $$invalidate(9, $fragmentState = $$value));
    	let autoModifiers;
    	let fragmentModalVisibility;
    	let modifierModalVisibility;
    	let inputType;
    	let inputStartTime;
    	let inputEndTime;
    	let inputMovements;
    	let inputLegs;
    	let inputDirection;
    	let inputSupport;
    	let inputRotations;

    	onDestroy(() => {
    		console.log("fragment modal destroyed");

    		if ($routineState.fragments.length !== 0) {
    			set_store_value(fragmentState, $fragmentState.startTime = $routineState.fragments[$routineState.fragments.length - 1].endTime, $fragmentState);
    		} else {
    			set_store_value(fragmentState, $fragmentState.startTime = "00:00", $fragmentState);
    		}

    		set_store_value(fragmentState, $fragmentState.endTime = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.numberOfMovements = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.legs = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.basicMark = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.direction = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.support = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.rotations = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.difficulty = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.modifiers = [], $fragmentState);
    	});

    	onMount(async () => {
    		console.log("fragment modal mounted");
    		set_store_value(fragmentState, $fragmentState.type = "", $fragmentState);

    		if ($routineState.fragments.length !== 0) {
    			set_store_value(fragmentState, $fragmentState.startTime = $routineState.fragments[$routineState.fragments.length - 1].endTime, $fragmentState);
    		} else {
    			set_store_value(fragmentState, $fragmentState.startTime = null, $fragmentState);
    		}

    		set_store_value(fragmentState, $fragmentState.endTime = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.numberOfMovements = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.legs = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.basicMark = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.direction = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.support = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.rotations = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.difficulty = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.modifiers = [], $fragmentState);
    		let data = await fetch("./modifiers.json").then(res => res.json());

    		autoModifiers = data.filter(item => {
    			return item.category === "Auto";
    		});

    		inputType.addEventListener("change", () => {
    			rerenderModal();
    		});
    	});

    	let modals = modalStates.subscribe(state => {
    		fragmentModalVisibility = state.fragmentModalVisibility;
    		modifierModalVisibility = state.modifierModalVisibility;
    	});

    	const saveFragment = function () {
    		if (inputType.value === "") {
    			inputType.setCustomValidity("Please firstly choose type of the part of the routine");
    		} else {
    			inputType.setCustomValidity("");
    		}

    		if (inputStartTime && inputStartTime.reportValidity() && (inputEndTime && inputEndTime.reportValidity())) {
    			let fragment = get_store_value(fragmentState);
    			let program = get_store_value(routineState);
    			fragment.duration = calculateFragmentDuration(fragment);

    			if (fragment.type === "hybrid") {
    				fragment.level = calculateHybridLevel(fragment);
    			}

    			fragment.basicMark = calculateFragmentBasicMark(fragment);
    			fragment.difficulty = calculateFragmentDifficulty(fragment, program.type);
    			set_store_value(routineState, $routineState.fragments = [...program.fragments, Object.assign({}, fragment)], $routineState);
    			set_store_value(routineState, $routineState.fragments = $routineState.fragments.sort((a, b) => a.startTime < b.startTime ? -1 : 1), $routineState);
    			set_store_value(routineState, $routineState.duration = calculateRoutineTime($routineState), $routineState);
    			let { hybridsTime, hybridsPercent, hybridsScore } = calculateHybridTime($routineState);
    			set_store_value(routineState, $routineState.hybridsTime = hybridsTime, $routineState);
    			set_store_value(routineState, $routineState.hybridsPercent = String(Math.round(hybridsPercent * 100)) + "%", $routineState);
    			set_store_value(routineState, $routineState.hybridsScore = hybridsScore.toFixed(2), $routineState);
    			set_store_value(routineState, $routineState.mark = calculateRoutineDifficulty($routineState), $routineState);
    			hideFragmentModal();
    		}
    	};

    	const addModifier = function () {
    		console.log(inputType.value);

    		if (inputType.value === "") {
    			inputType.setCustomValidity("Please firstly choose type of the part of the routine");
    		} else {
    			inputType.setCustomValidity("");
    		}

    		if (inputType && inputType.reportValidity() && (inputStartTime && inputStartTime.reportValidity()) && (inputEndTime && inputEndTime.reportValidity()) && (!inputMovements || inputMovements.reportValidity()) && (!inputLegs || inputLegs.reportValidity()) && (!inputDirection || inputDirection.reportValidity()) && (!inputSupport || inputSupport.reportValidity()) && (!inputRotations || inputRotations.reportValidity())) {
    			showModifierModal();
    		}
    	};

    	const removeModifier = function (modifier) {
    		let index = $fragmentState.modifiers.findIndex(el => el === modifier);

    		set_store_value(
    			fragmentState,
    			$fragmentState.modifiers = [
    				...$fragmentState.modifiers.slice(0, index),
    				...$fragmentState.modifiers.slice(index + 1)
    			],
    			$fragmentState
    		);
    	};

    	/*const checkAutoModifiers = function () {
        if ($fragmentState.type === 'hybrid') {
            $fragmentState.modifiers = $fragmentState.modifiers.filter(modifier=>modifier.category!=='Auto')
            let fragment = Object.assign({}, get(fragmentState))
            fragment.duration = (calculateFragmentDuration(fragment));
            let hybridLevel = Number(fragment.duration) < 16 ? (Number(fragment.duration) < 10 ? 0.1 : 0.2) : 0.3;
            let movementsLevel = $fragmentState.numberOfMovements === '<6' ? 0.1 : ($fragmentState.numberOfMovements === "6-20" ? 0.2 : ($fragmentState.numberOfMovements === '21-30' ?  0.3 : 0.4));
            let comparsion = hybridLevel === movementsLevel ? 'equal' : movementsLevel > hybridLevel
            console.log(`Duration: ${fragment.duration}\nMovements: ${$fragmentState.numberOfMovements}\nhybridLevel: ${hybridLevel}\nmovementsLevel: ${movementsLevel}`)
            if (comparsion !== 'equal') {
                let modifier;
                if (comparsion) {
                    if ($fragmentState.modifiers.indexOf(autoModifiers[0]) !== -1) {
                        removeModifier(autoModifiers[0])
                    }
                    modifier = autoModifiers[1];
                } else {
                        if ($fragmentState.modifiers.indexOf(autoModifiers[1]) !== -1) {
                            removeModifier(autoModifiers[1])
                        }
                        modifier = autoModifiers[0]
                }
                console.log($fragmentState.modifiers.indexOf(modifier))
                if ($fragmentState.modifiers.indexOf(modifier) === -1) {
                    console.log(modifier);
                    $fragmentState.modifiers = [...$fragmentState.modifiers, modifier];
                }
            } else {
                if(movementsLevel !== 0.4) {
                    if ($fragmentState.modifiers.indexOf(autoModifiers[1]) !== -1) {
                        removeModifier(autoModifiers[1])
                    }
                    if ($fragmentState.modifiers.indexOf(autoModifiers[0]) !== -1) {
                        removeModifier(autoModifiers[0])
                    }
                }
                if(movementsLevel === 0.4){
                    $fragmentState.modifiers = [...$fragmentState.modifiers, autoModifiers[1]];
                }
            }
            if (fragment.duration > 20) {
                if ($fragmentState.modifiers.indexOf(autoModifiers[2]) === -1) {
                    $fragmentState.modifiers = [...$fragmentState.modifiers, autoModifiers[2]];
                }
            } else {
                if ($fragmentState.modifiers.indexOf(autoModifiers[2]) !== -1) {
                    removeModifier(autoModifiers[2])
                }
            }
        }
    }
    */
    	const rerenderModal = function () {
    		inputType.setCustomValidity("");
    		set_store_value(fragmentState, $fragmentState.duration = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.numberOfMovements = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.legs = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.basicMark = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.direction = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.support = null, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.rotations = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.difficulty = 0, $fragmentState);
    		set_store_value(fragmentState, $fragmentState.modifiers = [], $fragmentState);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<FragmentModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FragmentModal", $$slots, []);

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputType = $$value;
    			$$invalidate(0, inputType);
    		});
    	}

    	function select_change_handler() {
    		$fragmentState.type = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputStartTime = $$value;
    			$$invalidate(1, inputStartTime);
    		});
    	}

    	function input0_input_handler() {
    		$fragmentState.startTime = this.value;
    		fragmentState.set($fragmentState);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputEndTime = $$value;
    			$$invalidate(2, inputEndTime);
    		});
    	}

    	function input1_input_handler() {
    		$fragmentState.endTime = this.value;
    		fragmentState.set($fragmentState);
    	}

    	function select0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputDirection = $$value;
    			$$invalidate(5, inputDirection);
    		});
    	}

    	function select0_change_handler() {
    		$fragmentState.direction = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function select1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputSupport = $$value;
    			$$invalidate(6, inputSupport);
    		});
    	}

    	function select1_change_handler() {
    		$fragmentState.support = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputRotations = $$value;
    			$$invalidate(7, inputRotations);
    		});
    	}

    	function input_input_handler() {
    		$fragmentState.rotations = to_number(this.value);
    		fragmentState.set($fragmentState);
    	}

    	function select0_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputMovements = $$value;
    			$$invalidate(3, inputMovements);
    		});
    	}

    	function select0_change_handler_1() {
    		$fragmentState.numberOfMovements = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function select1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputLegs = $$value;
    			$$invalidate(4, inputLegs);
    		});
    	}

    	function select1_change_handler_1() {
    		$fragmentState.legs = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	const click_handler = modifier => removeModifier(modifier);

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		setContext,
    		get: get_store_value,
    		modalStates,
    		fragmentState,
    		routineState,
    		showModifierModal,
    		hideFragmentModal,
    		showFragmentModal,
    		calculateFragmentBasicMark,
    		calculateFragmentDifficulty,
    		calculateRoutineDifficulty,
    		calculateRoutineTime,
    		calculateHybridLevel,
    		calculateFragmentDuration,
    		calculateHybridTime,
    		Modal,
    		Modifier,
    		autoModifiers,
    		fragmentModalVisibility,
    		modifierModalVisibility,
    		inputType,
    		inputStartTime,
    		inputEndTime,
    		inputMovements,
    		inputLegs,
    		inputDirection,
    		inputSupport,
    		inputRotations,
    		modals,
    		saveFragment,
    		addModifier,
    		removeModifier,
    		rerenderModal,
    		$routineState,
    		$fragmentState
    	});

    	$$self.$inject_state = $$props => {
    		if ("autoModifiers" in $$props) autoModifiers = $$props.autoModifiers;
    		if ("fragmentModalVisibility" in $$props) fragmentModalVisibility = $$props.fragmentModalVisibility;
    		if ("modifierModalVisibility" in $$props) modifierModalVisibility = $$props.modifierModalVisibility;
    		if ("inputType" in $$props) $$invalidate(0, inputType = $$props.inputType);
    		if ("inputStartTime" in $$props) $$invalidate(1, inputStartTime = $$props.inputStartTime);
    		if ("inputEndTime" in $$props) $$invalidate(2, inputEndTime = $$props.inputEndTime);
    		if ("inputMovements" in $$props) $$invalidate(3, inputMovements = $$props.inputMovements);
    		if ("inputLegs" in $$props) $$invalidate(4, inputLegs = $$props.inputLegs);
    		if ("inputDirection" in $$props) $$invalidate(5, inputDirection = $$props.inputDirection);
    		if ("inputSupport" in $$props) $$invalidate(6, inputSupport = $$props.inputSupport);
    		if ("inputRotations" in $$props) $$invalidate(7, inputRotations = $$props.inputRotations);
    		if ("modals" in $$props) modals = $$props.modals;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		inputType,
    		inputStartTime,
    		inputEndTime,
    		inputMovements,
    		inputLegs,
    		inputDirection,
    		inputSupport,
    		inputRotations,
    		$routineState,
    		$fragmentState,
    		saveFragment,
    		addModifier,
    		removeModifier,
    		select_binding,
    		select_change_handler,
    		input0_binding,
    		input0_input_handler,
    		input1_binding,
    		input1_input_handler,
    		select0_binding,
    		select0_change_handler,
    		select1_binding,
    		select1_change_handler,
    		input_binding,
    		input_input_handler,
    		select0_binding_1,
    		select0_change_handler_1,
    		select1_binding_1,
    		select1_change_handler_1,
    		click_handler
    	];
    }

    class FragmentModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FragmentModal",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\ModifiersModal.svelte generated by Svelte v3.23.2 */
    const file$3 = "src\\ModifiersModal.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (36:4) <div slot="header">
    function create_header_slot_1$1(ctx) {
    	let div0;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			div1.textContent = "New Modifier";
    			add_location(div1, file$3, 36, 8, 1209);
    			attr_dev(div0, "slot", "header");
    			add_location(div0, file$3, 35, 4, 1180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot_1$1.name,
    		type: "slot",
    		source: "(36:4) <div slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (54:8) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(54:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:16) <div slot="header" class="modifier-header">
    function create_header_slot$1(ctx) {
    	let div;
    	let t_value = /*modifier*/ ctx[8]["category"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "header");
    			attr_dev(div, "class", "modifier-header svelte-16w8454");
    			add_location(div, file$3, 43, 16, 1433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modifiers*/ 1 && t_value !== (t_value = /*modifier*/ ctx[8]["category"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot$1.name,
    		type: "slot",
    		source: "(44:16) <div slot=\\\"header\\\" class=\\\"modifier-header\\\">",
    		ctx
    	});

    	return block;
    }

    // (47:16) <div slot="body" class="modifier-body">
    function create_body_slot_1$1(ctx) {
    	let div;
    	let t_value = /*modifier*/ ctx[8].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "body");
    			attr_dev(div, "class", "modifier-body svelte-16w8454");
    			add_location(div, file$3, 46, 16, 1562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modifiers*/ 1 && t_value !== (t_value = /*modifier*/ ctx[8].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot_1$1.name,
    		type: "slot",
    		source: "(47:16) <div slot=\\\"body\\\" class=\\\"modifier-body\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:16) <div slot="footer" class="modifier-footer">
    function create_footer_slot_1$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*modifier*/ ctx[8]["values"][/*$routineState*/ ctx[1].type] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Score: ");
    			t1 = text(t1_value);
    			attr_dev(div, "slot", "footer");
    			attr_dev(div, "class", "modifier-footer svelte-16w8454");
    			add_location(div, file$3, 49, 16, 1680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*modifiers, $routineState*/ 3 && t1_value !== (t1_value = /*modifier*/ ctx[8]["values"][/*$routineState*/ ctx[1].type] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot_1$1.name,
    		type: "slot",
    		source: "(50:16) <div slot=\\\"footer\\\" class=\\\"modifier-footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (43:12) <Modifier on:click={()=>addModifier(modifier)}>
    function create_default_slot_1$1(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(43:12) <Modifier on:click={()=>addModifier(modifier)}>",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each modifiers as modifier}
    function create_each_block$1(ctx) {
    	let modifier;
    	let current;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*modifier*/ ctx[8], ...args);
    	}

    	modifier = new Modifier({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$1],
    					footer: [create_footer_slot_1$1],
    					body: [create_body_slot_1$1],
    					header: [create_header_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modifier.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(modifier.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modifier, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const modifier_changes = {};

    			if (dirty & /*$$scope, modifiers, $routineState*/ 2051) {
    				modifier_changes.$$scope = { dirty, ctx };
    			}

    			modifier.$set(modifier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modifier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modifier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modifier, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:8) {#each modifiers as modifier}",
    		ctx
    	});

    	return block;
    }

    // (41:4) <div slot="body" class="modifiers-table">
    function create_body_slot$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*modifiers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "slot", "body");
    			attr_dev(div, "class", "modifiers-table svelte-16w8454");
    			add_location(div, file$3, 40, 4, 1274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*addModifier, modifiers, $routineState*/ 7) {
    				each_value = /*modifiers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot$1.name,
    		type: "slot",
    		source: "(41:4) <div slot=\\\"body\\\" class=\\\"modifiers-table\\\">",
    		ctx
    	});

    	return block;
    }

    // (58:4) <div slot="footer">
    function create_footer_slot$1(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Dismiss";
    			attr_dev(button, "class", "btn btn-danger");
    			add_location(button, file$3, 58, 8, 1950);
    			attr_dev(div, "slot", "footer");
    			add_location(div, file$3, 57, 4, 1921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", hideModifierModal, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot$1.name,
    		type: "slot",
    		source: "(58:4) <div slot=\\\"footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (35:0) <Modal on:close="{hideModifierModal}" z_index=2>
    function create_default_slot$1(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(35:0) <Modal on:close=\\\"{hideModifierModal}\\\" z_index=2>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				z_index: "2",
    				$$slots: {
    					default: [create_default_slot$1],
    					footer: [create_footer_slot$1],
    					body: [create_body_slot$1],
    					header: [create_header_slot_1$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", hideModifierModal);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, modifiers, $routineState*/ 2051) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $fragmentState;
    	let $routineState;
    	validate_store(fragmentState, "fragmentState");
    	component_subscribe($$self, fragmentState, $$value => $$invalidate(6, $fragmentState = $$value));
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(1, $routineState = $$value));
    	let fragmentModalVisibility;
    	let modifierModalVisibility;
    	let modifiers = [];

    	onMount(async () => {
    		let program = get_store_value(routineState);
    		let data = await fetch("./modifiers.json").then(res => res.json());

    		$$invalidate(0, modifiers = data.filter(item => {
    			return item.type === $fragmentState.type && item["values"][program.type] !== null && item.category !== "Auto";
    		}));
    	});

    	let modals = modalStates.subscribe(state => {
    		fragmentModalVisibility = state.fragmentModalVisibility;
    		modifierModalVisibility = state.modifierModalVisibility;
    	});

    	const addModifier = function (modifier) {
    		set_store_value(fragmentState, $fragmentState.modifiers = [...$fragmentState.modifiers, modifier], $fragmentState);
    		hideModifierModal();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ModifiersModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ModifiersModal", $$slots, []);
    	const click_handler = modifier => addModifier(modifier);

    	$$self.$capture_state = () => ({
    		modalStates,
    		routineState,
    		fragmentState,
    		get: get_store_value,
    		onMount,
    		onDestroy,
    		Modal,
    		hideModifierModal,
    		Modifier,
    		fragmentModalVisibility,
    		modifierModalVisibility,
    		modifiers,
    		modals,
    		addModifier,
    		$fragmentState,
    		$routineState
    	});

    	$$self.$inject_state = $$props => {
    		if ("fragmentModalVisibility" in $$props) fragmentModalVisibility = $$props.fragmentModalVisibility;
    		if ("modifierModalVisibility" in $$props) modifierModalVisibility = $$props.modifierModalVisibility;
    		if ("modifiers" in $$props) $$invalidate(0, modifiers = $$props.modifiers);
    		if ("modals" in $$props) modals = $$props.modals;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modifiers, $routineState, addModifier, click_handler];
    }

    class ModifiersModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModifiersModal",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\EditFragmentModal.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "src\\EditFragmentModal.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    // (140:4) <div slot="header">
    function create_header_slot_1$2(ctx) {
    	let div0;
    	let div1;
    	let h2;
    	let t0;
    	let t1_value = /*index*/ ctx[0] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text("Edit Fragment №");
    			t1 = text(t1_value);
    			add_location(h2, file$4, 141, 12, 6557);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$4, 140, 8, 6526);
    			attr_dev(div0, "slot", "header");
    			add_location(div0, file$4, 139, 4, 6497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*index*/ 1 && t1_value !== (t1_value = /*index*/ ctx[0] + 1 + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot_1$2.name,
    		type: "slot",
    		source: "(140:4) <div slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (164:12) {#if $fragmentState.type === "pair acrobatics"}
    function create_if_block_1$1(ctx) {
    	let label0;
    	let t0;
    	let select0;
    	let option0;
    	let option1;
    	let option1_value_value;
    	let option2;
    	let option2_value_value;
    	let t4;
    	let label1;
    	let t5;
    	let select1;
    	let option3;
    	let option4;
    	let option4_value_value;
    	let option5;
    	let option5_value_value;
    	let t9;
    	let label2;
    	let t10;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			t0 = text("Direction\r\n                    ");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			option1 = element("option");
    			option1.textContent = "Heads up";
    			option2 = element("option");
    			option2.textContent = "Legs up";
    			t4 = space();
    			label1 = element("label");
    			t5 = text("Support type\r\n                    ");
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "Choose...";
    			option4 = element("option");
    			option4.textContent = "Lift";
    			option5 = element("option");
    			option5.textContent = "Throw";
    			t9 = space();
    			label2 = element("label");
    			t10 = text("360° Rotations\r\n                    ");
    			input = element("input");
    			option0.disabled = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 167, 24, 7959);
    			option1.__value = option1_value_value = 0.1;
    			option1.value = option1.__value;
    			add_location(option1, file$4, 168, 24, 8026);
    			option2.__value = option2_value_value = 0.2;
    			option2.value = option2.__value;
    			add_location(option2, file$4, 169, 24, 8091);
    			select0.required = true;
    			attr_dev(select0, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[10].direction === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[22].call(select0));
    			add_location(select0, file$4, 165, 20, 7800);
    			add_location(label0, file$4, 164, 16, 7762);
    			option3.disabled = true;
    			option3.__value = "";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 175, 24, 8373);
    			option4.__value = option4_value_value = 0;
    			option4.value = option4.__value;
    			add_location(option4, file$4, 176, 24, 8440);
    			option5.__value = option5_value_value = 0.1;
    			option5.value = option5.__value;
    			add_location(option5, file$4, 177, 24, 8499);
    			select1.required = true;
    			attr_dev(select1, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[10].support === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[24].call(select1));
    			add_location(select1, file$4, 174, 20, 8247);
    			add_location(label1, file$4, 173, 16, 8206);
    			input.required = true;
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$4, 182, 20, 8655);
    			add_location(label2, file$4, 181, 16, 8612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t0);
    			append_dev(label0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			/*select0_binding*/ ctx[21](select0);
    			select_option(select0, /*$fragmentState*/ ctx[10].direction);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t5);
    			append_dev(label1, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			/*select1_binding*/ ctx[23](select1);
    			select_option(select1, /*$fragmentState*/ ctx[10].support);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, t10);
    			append_dev(label2, input);
    			/*input_binding*/ ctx[25](input);
    			set_input_value(input, /*$fragmentState*/ ctx[10].rotations);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[22]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[24]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[26])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 1024) {
    				select_option(select0, /*$fragmentState*/ ctx[10].direction);
    			}

    			if (dirty[0] & /*$fragmentState*/ 1024) {
    				select_option(select1, /*$fragmentState*/ ctx[10].support);
    			}

    			if (dirty[0] & /*$fragmentState*/ 1024 && to_number(input.value) !== /*$fragmentState*/ ctx[10].rotations) {
    				set_input_value(input, /*$fragmentState*/ ctx[10].rotations);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			/*select0_binding*/ ctx[21](null);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(label1);
    			/*select1_binding*/ ctx[23](null);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(label2);
    			/*input_binding*/ ctx[25](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(164:12) {#if $fragmentState.type === \\\"pair acrobatics\\\"}",
    		ctx
    	});

    	return block;
    }

    // (188:12) {#if $fragmentState.type === "hybrid"}
    function create_if_block$1(ctx) {
    	let label0;
    	let t0;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t6;
    	let label1;
    	let t7;
    	let select1;
    	let option5;
    	let option6;
    	let option7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			t0 = text("Number of Movements\r\n                    ");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			option1 = element("option");
    			option1.textContent = "<6";
    			option2 = element("option");
    			option2.textContent = "6-20";
    			option3 = element("option");
    			option3.textContent = "21-30";
    			option4 = element("option");
    			option4.textContent = ">30";
    			t6 = space();
    			label1 = element("label");
    			t7 = text("Legs\r\n                    ");
    			select1 = element("select");
    			option5 = element("option");
    			option5.textContent = "Choose...";
    			option6 = element("option");
    			option6.textContent = "One leg (raising or lifting)";
    			option7 = element("option");
    			option7.textContent = "Two legs (raising or lifting)";
    			option0.selected = true;
    			option0.disabled = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 191, 24, 9165);
    			option1.__value = "<6";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 192, 24, 9241);
    			option2.__value = "6-20";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 193, 24, 9300);
    			option3.__value = "21-30";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 194, 24, 9360);
    			option4.__value = ">30";
    			option4.value = option4.__value;
    			add_location(option4, file$4, 195, 24, 9422);
    			select0.required = true;
    			attr_dev(select0, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[10].numberOfMovements === void 0) add_render_callback(() => /*select0_change_handler_1*/ ctx[28].call(select0));
    			add_location(select0, file$4, 189, 20, 8998);
    			add_location(label0, file$4, 188, 16, 8950);
    			option5.disabled = true;
    			option5.__value = "";
    			option5.value = option5.__value;
    			add_location(option5, file$4, 200, 24, 9687);
    			option6.__value = "1";
    			option6.value = option6.__value;
    			add_location(option6, file$4, 201, 24, 9754);
    			option7.__value = "2";
    			option7.value = option7.__value;
    			add_location(option7, file$4, 202, 24, 9835);
    			select1.required = true;
    			attr_dev(select1, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[10].legs === void 0) add_render_callback(() => /*select1_change_handler_1*/ ctx[30].call(select1));
    			add_location(select1, file$4, 199, 20, 9567);
    			add_location(label1, file$4, 198, 16, 9534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t0);
    			append_dev(label0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			/*select0_binding_1*/ ctx[27](select0);
    			select_option(select0, /*$fragmentState*/ ctx[10].numberOfMovements);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t7);
    			append_dev(label1, select1);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			/*select1_binding_1*/ ctx[29](select1);
    			select_option(select1, /*$fragmentState*/ ctx[10].legs);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler_1*/ ctx[28]),
    					listen_dev(select1, "change", /*select1_change_handler_1*/ ctx[30])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 1024) {
    				select_option(select0, /*$fragmentState*/ ctx[10].numberOfMovements);
    			}

    			if (dirty[0] & /*$fragmentState*/ 1024) {
    				select_option(select1, /*$fragmentState*/ ctx[10].legs);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			/*select0_binding_1*/ ctx[27](null);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(label1);
    			/*select1_binding_1*/ ctx[29](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(188:12) {#if $fragmentState.type === \\\"hybrid\\\"}",
    		ctx
    	});

    	return block;
    }

    // (225:12) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Additional movements will be here.\r\n                ";
    			add_location(div, file$4, 225, 16, 10811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(225:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (212:20) <div slot="header">
    function create_header_slot$2(ctx) {
    	let div;
    	let t_value = /*modifier*/ ctx[36]["category"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "header");
    			add_location(div, file$4, 211, 20, 10235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 1024 && t_value !== (t_value = /*modifier*/ ctx[36]["category"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot$2.name,
    		type: "slot",
    		source: "(212:20) <div slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (215:20) <div slot="body">
    function create_body_slot_1$2(ctx) {
    	let div;
    	let t_value = /*modifier*/ ctx[36].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "slot", "body");
    			add_location(div, file$4, 214, 20, 10352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 1024 && t_value !== (t_value = /*modifier*/ ctx[36].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot_1$2.name,
    		type: "slot",
    		source: "(215:20) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    // (221:20) <div class="close-button" slot="footer" on:click={()=>removeModifier(modifier)}>
    function create_footer_slot_1$2(ctx) {
    	let div0;
    	let t0;
    	let t1_value = /*modifier*/ ctx[36]["values"][/*$routineState*/ ctx[9].type] + "";
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[31](/*modifier*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Score: ");
    			t1 = text(t1_value);
    			div1 = element("div");
    			div1.textContent = "×";
    			attr_dev(div0, "slot", "footer");
    			add_location(div0, file$4, 217, 20, 10460);
    			attr_dev(div1, "class", "close-button");
    			attr_dev(div1, "slot", "footer");
    			add_location(div1, file$4, 220, 20, 10602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$fragmentState, $routineState*/ 1536 && t1_value !== (t1_value = /*modifier*/ ctx[36]["values"][/*$routineState*/ ctx[9].type] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot_1$2.name,
    		type: "slot",
    		source: "(221:20) <div class=\\\"close-button\\\" slot=\\\"footer\\\" on:click={()=>removeModifier(modifier)}>",
    		ctx
    	});

    	return block;
    }

    // (211:16) <Modifier>
    function create_default_slot_1$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(211:16) <Modifier>",
    		ctx
    	});

    	return block;
    }

    // (210:12) {#each $fragmentState.modifiers as modifier}
    function create_each_block$2(ctx) {
    	let modifier;
    	let current;

    	modifier = new Modifier({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$2],
    					footer: [create_footer_slot_1$2],
    					body: [create_body_slot_1$2],
    					header: [create_header_slot$2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modifier.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modifier, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modifier_changes = {};

    			if (dirty[0] & /*$fragmentState, $routineState*/ 1536 | dirty[1] & /*$$scope*/ 256) {
    				modifier_changes.$$scope = { dirty, ctx };
    			}

    			modifier.$set(modifier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modifier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modifier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modifier, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(210:12) {#each $fragmentState.modifiers as modifier}",
    		ctx
    	});

    	return block;
    }

    // (145:4) <div slot="body" class="container">
    function create_body_slot$2(ctx) {
    	let div0;
    	let div2;
    	let label0;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let input0;
    	let t6;
    	let label2;
    	let t8;
    	let input1;
    	let t9;
    	let t10;
    	let t11;
    	let button;
    	let t13;
    	let div3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$fragmentState*/ ctx[10].type === "pair acrobatics" && create_if_block_1$1(ctx);
    	let if_block1 = /*$fragmentState*/ ctx[10].type === "hybrid" && create_if_block$1(ctx);
    	let each_value = /*$fragmentState*/ ctx[10].modifiers;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$2(ctx);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			t0 = text("Type\r\n                ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Hybrid";
    			option1 = element("option");
    			option1.textContent = "Transition";
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Start time";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label2 = element("label");
    			label2.textContent = "End time";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			if (if_block0) if_block0.c();
    			t10 = space();
    			if (if_block1) if_block1.c();
    			t11 = space();
    			button = element("button");
    			button.textContent = "Add additional movement";
    			t13 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			option0.__value = "hybrid";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 149, 20, 6880);
    			option1.__value = "transition";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 150, 20, 6940);
    			select.disabled = true;
    			select.required = true;
    			attr_dev(select, "class", "custom-select");
    			if (/*$fragmentState*/ ctx[10].type === void 0) add_render_callback(() => /*select_change_handler*/ ctx[16].call(select));
    			add_location(select, file$4, 147, 16, 6730);
    			add_location(label0, file$4, 146, 12, 6701);
    			attr_dev(label1, "for", "startTime");
    			add_location(label1, file$4, 154, 16, 7115);
    			attr_dev(input0, "id", "startTime");
    			input0.required = true;
    			attr_dev(input0, "pattern", "[0-9]:[0-9][0-9]");
    			attr_dev(input0, "placeholder", "0:00");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$4, 155, 16, 7174);
    			attr_dev(label2, "for", "endTime");
    			add_location(label2, file$4, 158, 16, 7403);
    			attr_dev(input1, "id", "endTime");
    			input1.required = true;
    			attr_dev(input1, "pattern", "[0-9]:[0-9][0-9]");
    			attr_dev(input1, "placeholder", "0:00");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$4, 159, 16, 7458);
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "row");
    			add_location(div1, file$4, 153, 12, 7049);
    			attr_dev(button, "class", "btn btn-outline-primary svelte-1o5e5c");
    			add_location(button, file$4, 206, 12, 9981);
    			attr_dev(div2, "class", "form");
    			add_location(div2, file$4, 145, 8, 6669);
    			attr_dev(div3, "class", "modifiers svelte-1o5e5c");
    			add_location(div3, file$4, 208, 8, 10104);
    			attr_dev(div0, "slot", "body");
    			attr_dev(div0, "class", "container svelte-1o5e5c");
    			add_location(div0, file$4, 144, 4, 6624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div2);
    			append_dev(div2, label0);
    			append_dev(label0, t0);
    			append_dev(label0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			/*select_binding*/ ctx[15](select);
    			select_option(select, /*$fragmentState*/ ctx[10].type);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, input0);
    			/*input0_binding*/ ctx[17](input0);
    			set_input_value(input0, /*$fragmentState*/ ctx[10].startTime);
    			append_dev(div1, t6);
    			append_dev(div1, label2);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			/*input1_binding*/ ctx[19](input1);
    			set_input_value(input1, /*$fragmentState*/ ctx[10].endTime);
    			append_dev(div2, t9);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t10);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t11);
    			append_dev(div2, button);
    			append_dev(div0, t13);
    			append_dev(div0, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[16]),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[18]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[20]),
    					listen_dev(button, "click", /*addModifier*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$fragmentState*/ 1024) {
    				select_option(select, /*$fragmentState*/ ctx[10].type);
    			}

    			if (dirty[0] & /*$fragmentState*/ 1024 && input0.value !== /*$fragmentState*/ ctx[10].startTime) {
    				set_input_value(input0, /*$fragmentState*/ ctx[10].startTime);
    			}

    			if (dirty[0] & /*$fragmentState*/ 1024 && input1.value !== /*$fragmentState*/ ctx[10].endTime) {
    				set_input_value(input1, /*$fragmentState*/ ctx[10].endTime);
    			}

    			if (/*$fragmentState*/ ctx[10].type === "pair acrobatics") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div2, t10);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$fragmentState*/ ctx[10].type === "hybrid") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t11);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*removeModifier, $fragmentState, $routineState*/ 9728) {
    				each_value = /*$fragmentState*/ ctx[10].modifiers;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$2(ctx);
    					each_1_else.c();
    					each_1_else.m(div3, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*select_binding*/ ctx[15](null);
    			/*input0_binding*/ ctx[17](null);
    			/*input1_binding*/ ctx[19](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot$2.name,
    		type: "slot",
    		source: "(145:4) <div slot=\\\"body\\\" class=\\\"container\\\">",
    		ctx
    	});

    	return block;
    }

    // (232:4) <div slot="footer" class="footer">
    function create_footer_slot$2(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Confirm";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Dismiss";
    			attr_dev(button0, "class", "btn btn-primary svelte-1o5e5c");
    			add_location(button0, file$4, 232, 8, 10995);
    			attr_dev(button1, "class", "btn btn-danger svelte-1o5e5c");
    			add_location(button1, file$4, 233, 8, 11079);
    			attr_dev(div, "slot", "footer");
    			attr_dev(div, "class", "footer svelte-1o5e5c");
    			add_location(div, file$4, 231, 4, 10951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveFragment*/ ctx[11], false, false, false),
    					listen_dev(button1, "click", hideEditFragmentModal, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot$2.name,
    		type: "slot",
    		source: "(232:4) <div slot=\\\"footer\\\" class=\\\"footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (139:0) <Modal on:close="{hideEditFragmentModal}" z_index=1>
    function create_default_slot$2(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(139:0) <Modal on:close=\\\"{hideEditFragmentModal}\\\" z_index=1>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				z_index: "1",
    				$$slots: {
    					default: [create_default_slot$2],
    					footer: [create_footer_slot$2],
    					body: [create_body_slot$2],
    					header: [create_header_slot_1$2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", hideEditFragmentModal);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*$fragmentState, $routineState, inputLegs, inputMovements, inputRotations, inputSupport, inputDirection, inputEndTime, inputStartTime, inputType, index*/ 2047 | dirty[1] & /*$$scope*/ 256) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $routineState;
    	let $fragmentState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(9, $routineState = $$value));
    	validate_store(fragmentState, "fragmentState");
    	component_subscribe($$self, fragmentState, $$value => $$invalidate(10, $fragmentState = $$value));
    	let autoModifiers;
    	let fragmentModalVisibility;
    	let modifierModalVisibility;
    	let inputType;
    	let inputStartTime;
    	let inputEndTime;
    	let inputMovements;
    	let inputLegs;
    	let inputDirection;
    	let inputSupport;
    	let inputRotations;
    	let { fragment } = $$props;
    	let { index } = $$props;
    	fragmentState.set(fragment);

    	onMount(async () => {
    		let data = await fetch("./modifiers.json").then(res => res.json());

    		autoModifiers = data.filter(item => {
    			return item.category === "Auto" && item.type === fragment.type;
    		});
    	});

    	let modals = modalStates.subscribe(state => {
    		fragmentModalVisibility = state.fragmentModalVisibility;
    		modifierModalVisibility = state.modifierModalVisibility;
    	});

    	const saveFragment = function () {
    		let fragment = get_store_value(fragmentState);
    		let program = get_store_value(routineState);
    		fragment.duration = calculateFragmentDuration(fragment);

    		if (fragment.type === "hybrid") {
    			fragment.level = calculateHybridLevel(fragment);
    		}

    		fragment.basicMark = calculateFragmentBasicMark(fragment);
    		fragment.difficulty = calculateFragmentDifficulty(fragment, program.type);

    		set_store_value(
    			routineState,
    			$routineState.fragments = [
    				...$routineState.fragments.slice(0, index),
    				Object.assign({}, fragment),
    				...$routineState.fragments.slice(index + 1)
    			],
    			$routineState
    		);

    		set_store_value(routineState, $routineState.fragments = $routineState.fragments.sort((a, b) => a.startTime < b.startTime ? -1 : 1), $routineState);
    		set_store_value(routineState, $routineState.duration = calculateRoutineTime($routineState), $routineState);
    		let { hybridsTime, hybridsPercent, hybridsScore } = calculateHybridTime($routineState);
    		set_store_value(routineState, $routineState.hybridsTime = hybridsTime, $routineState);
    		set_store_value(routineState, $routineState.hybridsPercent = String(Math.round(hybridsPercent * 100)) + "%", $routineState);
    		set_store_value(routineState, $routineState.hybridsScore = hybridsScore.toFixed(2), $routineState);
    		set_store_value(routineState, $routineState.mark = calculateRoutineDifficulty($routineState), $routineState);
    		hideEditFragmentModal();
    	};

    	const addModifier = function () {
    		if (inputType && inputType.reportValidity() && (inputStartTime && inputStartTime.reportValidity()) && (inputEndTime && inputEndTime.reportValidity()) && (!inputMovements || inputMovements.reportValidity()) && (!inputLegs || inputLegs.reportValidity()) && (!inputDirection || inputDirection.reportValidity()) && (!inputSupport || inputSupport.reportValidity()) && (!inputRotations || inputRotations.reportValidity())) {
    			showModifierModal();
    		}
    	};

    	/*const checkAutoModifiers = function () {
        if ($fragmentState.type === 'hybrid') {
            $fragmentState.modifiers = $fragmentState.modifiers.filter(modifier=>modifier.category!=='Auto')
            let fragment = Object.assign({}, get(fragmentState))
            fragment.duration = (calculateFragmentDuration(fragment));
            let hybridLevel = Number(fragment.duration) < 16 ? (Number(fragment.duration) < 10 ? 0.1 : 0.2) : 0.3;
            let movementsLevel = $fragmentState.numberOfMovements === '<6' ? 0.1 : ($fragmentState.numberOfMovements === "6-20" ? 0.2 : ($fragmentState.numberOfMovements === '21-30' ?  0.3 : 0.4));
            let comparsion = hybridLevel === movementsLevel ? 'equal' : movementsLevel > hybridLevel
            console.log(`Duration: ${fragment.duration}\nMovements: ${$fragmentState.numberOfMovements}\nhybridLevel: ${hybridLevel}\nmovementsLevel: ${movementsLevel}`)
            if (comparsion !== 'equal') {
                let modifier;
                if (comparsion) {
                    if ($fragmentState.modifiers.indexOf(autoModifiers[0]) !== -1) {
                        removeModifier(autoModifiers[0])
                    }
                    modifier = autoModifiers[1];
                } else {
                    if ($fragmentState.modifiers.indexOf(autoModifiers[1]) !== -1) {
                        removeModifier(autoModifiers[1])
                    }
                    modifier = autoModifiers[0]
                }
                console.log($fragmentState.modifiers.indexOf(modifier))
                if ($fragmentState.modifiers.indexOf(modifier) === -1) {
                    console.log(modifier);
                    $fragmentState.modifiers = [...$fragmentState.modifiers, modifier];
                }
            } else {
                if(movementsLevel !== 0.4) {
                    if ($fragmentState.modifiers.indexOf(autoModifiers[1]) !== -1) {
                        removeModifier(autoModifiers[1])
                    }
                    if ($fragmentState.modifiers.indexOf(autoModifiers[0]) !== -1) {
                        removeModifier(autoModifiers[0])
                    }
                }
                if(movementsLevel === 0.4){
                    $fragmentState.modifiers = [...$fragmentState.modifiers, autoModifiers[1]];
                }
            }
            if (fragment.duration > 20) {
                if ($fragmentState.modifiers.indexOf(autoModifiers[2]) === -1) {
                    $fragmentState.modifiers = [...$fragmentState.modifiers, autoModifiers[2]];
                }
            } else {
                if ($fragmentState.modifiers.indexOf(autoModifiers[2]) !== -1) {
                    removeModifier(autoModifiers[2])
                }
            }
        }
    }
    */
    	const removeModifier = function (modifier) {
    		let index = $fragmentState.modifiers.findIndex(el => el === modifier);

    		set_store_value(
    			fragmentState,
    			$fragmentState.modifiers = [
    				...$fragmentState.modifiers.slice(0, index),
    				...$fragmentState.modifiers.slice(index + 1)
    			],
    			$fragmentState
    		);
    	};

    	const writable_props = ["fragment", "index"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditFragmentModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditFragmentModal", $$slots, []);

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputType = $$value;
    			$$invalidate(1, inputType);
    		});
    	}

    	function select_change_handler() {
    		$fragmentState.type = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputStartTime = $$value;
    			$$invalidate(2, inputStartTime);
    		});
    	}

    	function input0_input_handler() {
    		$fragmentState.startTime = this.value;
    		fragmentState.set($fragmentState);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputEndTime = $$value;
    			$$invalidate(3, inputEndTime);
    		});
    	}

    	function input1_input_handler() {
    		$fragmentState.endTime = this.value;
    		fragmentState.set($fragmentState);
    	}

    	function select0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputDirection = $$value;
    			$$invalidate(6, inputDirection);
    		});
    	}

    	function select0_change_handler() {
    		$fragmentState.direction = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function select1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputSupport = $$value;
    			$$invalidate(7, inputSupport);
    		});
    	}

    	function select1_change_handler() {
    		$fragmentState.support = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputRotations = $$value;
    			$$invalidate(8, inputRotations);
    		});
    	}

    	function input_input_handler() {
    		$fragmentState.rotations = to_number(this.value);
    		fragmentState.set($fragmentState);
    	}

    	function select0_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputMovements = $$value;
    			$$invalidate(4, inputMovements);
    		});
    	}

    	function select0_change_handler_1() {
    		$fragmentState.numberOfMovements = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	function select1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputLegs = $$value;
    			$$invalidate(5, inputLegs);
    		});
    	}

    	function select1_change_handler_1() {
    		$fragmentState.legs = select_value(this);
    		fragmentState.set($fragmentState);
    	}

    	const click_handler = modifier => removeModifier(modifier);

    	$$self.$set = $$props => {
    		if ("fragment" in $$props) $$invalidate(14, fragment = $$props.fragment);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		setContext,
    		get: get_store_value,
    		modalStates,
    		fragmentState,
    		routineState,
    		showModifierModal,
    		hideEditFragmentModal,
    		calculateFragmentBasicMark,
    		calculateFragmentDifficulty,
    		calculateRoutineDifficulty,
    		calculateRoutineTime,
    		calculateHybridLevel,
    		calculateFragmentDuration,
    		calculateHybridTime,
    		Modal,
    		Modifier,
    		autoModifiers,
    		fragmentModalVisibility,
    		modifierModalVisibility,
    		inputType,
    		inputStartTime,
    		inputEndTime,
    		inputMovements,
    		inputLegs,
    		inputDirection,
    		inputSupport,
    		inputRotations,
    		fragment,
    		index,
    		modals,
    		saveFragment,
    		addModifier,
    		removeModifier,
    		$routineState,
    		$fragmentState
    	});

    	$$self.$inject_state = $$props => {
    		if ("autoModifiers" in $$props) autoModifiers = $$props.autoModifiers;
    		if ("fragmentModalVisibility" in $$props) fragmentModalVisibility = $$props.fragmentModalVisibility;
    		if ("modifierModalVisibility" in $$props) modifierModalVisibility = $$props.modifierModalVisibility;
    		if ("inputType" in $$props) $$invalidate(1, inputType = $$props.inputType);
    		if ("inputStartTime" in $$props) $$invalidate(2, inputStartTime = $$props.inputStartTime);
    		if ("inputEndTime" in $$props) $$invalidate(3, inputEndTime = $$props.inputEndTime);
    		if ("inputMovements" in $$props) $$invalidate(4, inputMovements = $$props.inputMovements);
    		if ("inputLegs" in $$props) $$invalidate(5, inputLegs = $$props.inputLegs);
    		if ("inputDirection" in $$props) $$invalidate(6, inputDirection = $$props.inputDirection);
    		if ("inputSupport" in $$props) $$invalidate(7, inputSupport = $$props.inputSupport);
    		if ("inputRotations" in $$props) $$invalidate(8, inputRotations = $$props.inputRotations);
    		if ("fragment" in $$props) $$invalidate(14, fragment = $$props.fragment);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("modals" in $$props) modals = $$props.modals;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		inputType,
    		inputStartTime,
    		inputEndTime,
    		inputMovements,
    		inputLegs,
    		inputDirection,
    		inputSupport,
    		inputRotations,
    		$routineState,
    		$fragmentState,
    		saveFragment,
    		addModifier,
    		removeModifier,
    		fragment,
    		select_binding,
    		select_change_handler,
    		input0_binding,
    		input0_input_handler,
    		input1_binding,
    		input1_input_handler,
    		select0_binding,
    		select0_change_handler,
    		select1_binding,
    		select1_change_handler,
    		input_binding,
    		input_input_handler,
    		select0_binding_1,
    		select0_change_handler_1,
    		select1_binding_1,
    		select1_change_handler_1,
    		click_handler
    	];
    }

    class EditFragmentModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { fragment: 14, index: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditFragmentModal",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fragment*/ ctx[14] === undefined && !("fragment" in props)) {
    			console.warn("<EditFragmentModal> was created without expected prop 'fragment'");
    		}

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<EditFragmentModal> was created without expected prop 'index'");
    		}
    	}

    	get fragment() {
    		throw new Error("<EditFragmentModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fragment(value) {
    		throw new Error("<EditFragmentModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<EditFragmentModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<EditFragmentModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Fragment.svelte generated by Svelte v3.23.2 */

    const file$5 = "src\\Fragment.svelte";
    const get_footer_slot_changes$2 = dirty => ({});
    const get_footer_slot_context$2 = ctx => ({});
    const get_body_slot_changes$2 = dirty => ({});
    const get_body_slot_context$2 = ctx => ({});
    const get_header_slot_changes$2 = dirty => ({});
    const get_header_slot_context$2 = ctx => ({});

    function create_fragment$5(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*$$slots*/ ctx[1].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[0], get_header_slot_context$2);
    	const body_slot_template = /*$$slots*/ ctx[1].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[0], get_body_slot_context$2);
    	const footer_slot_template = /*$$slots*/ ctx[1].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[0], get_footer_slot_context$2);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div1 = element("div");
    			if (body_slot) body_slot.c();
    			t1 = space();
    			div2 = element("div");
    			if (footer_slot) footer_slot.c();
    			attr_dev(div0, "class", "header svelte-ojmbpa");
    			add_location(div0, file$5, 4, 4, 60);
    			attr_dev(div1, "class", "body svelte-ojmbpa");
    			add_location(div1, file$5, 7, 4, 130);
    			attr_dev(div2, "class", "footer svelte-ojmbpa");
    			add_location(div2, file$5, 10, 4, 196);
    			attr_dev(div3, "class", "fragment svelte-ojmbpa");
    			add_location(div3, file$5, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			if (header_slot) {
    				header_slot.m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div1);

    			if (body_slot) {
    				body_slot.m(div1, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			if (footer_slot) {
    				footer_slot.m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_header_slot_changes$2, get_header_slot_context$2);
    				}
    			}

    			if (body_slot) {
    				if (body_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(body_slot, body_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_body_slot_changes$2, get_body_slot_context$2);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_footer_slot_changes$2, get_footer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(body_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(body_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (header_slot) header_slot.d(detaching);
    			if (body_slot) body_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fragment> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fragment", $$slots, ['header','body','footer']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots, click_handler];
    }

    class Fragment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fragment",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Main.svelte generated by Svelte v3.23.2 */

    const { console: console_1$1 } = globals;
    const file$6 = "src\\Main.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    // (135:4) {#if $routineState.type}
    function create_if_block_4(ctx) {
    	let div0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let div1;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Press here to get .asd file";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Press here to print report";
    			t3 = space();
    			div1 = element("div");
    			button2 = element("button");
    			button2.textContent = "Press here to add new\r\n                part of the routine";
    			attr_dev(button0, "class", "btn btn-outline-primary");
    			add_location(button0, file$6, 136, 12, 5281);
    			attr_dev(button1, "class", "btn btn-outline-primary ");
    			add_location(button1, file$6, 137, 12, 5394);
    			attr_dev(div0, "class", "row svelte-11iwgh3");
    			add_location(div0, file$6, 135, 8, 5250);
    			attr_dev(button2, "class", "btn btn-primary");
    			add_location(button2, file$6, 140, 12, 5553);
    			attr_dev(div1, "class", "row-flex svelte-11iwgh3");
    			add_location(div1, file$6, 139, 8, 5517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveDataset*/ ctx[17], false, false, false),
    					listen_dev(button1, "click", /*printForm*/ ctx[13], false, false, false),
    					listen_dev(button2, "click", showFragmentModal, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(135:4) {#if $routineState.type}",
    		ctx
    	});

    	return block;
    }

    // (146:4) {#if $routineState.type === "team"}
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let t0;
    	let label;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			label.textContent = "Hight level difficulty pattern\r\n                    changes\r\n                    (moving patterns, passing through patterns, close spaced, quick and sharp\r\n                    surface changes)";
    			attr_dev(input, "id", "team-unique");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "form-check-input svelte-11iwgh3");
    			add_location(input, file$6, 148, 16, 5836);
    			attr_dev(label, "for", "team-unique");
    			attr_dev(label, "class", "form-check-label");
    			add_location(label, file$6, 150, 16, 6024);
    			attr_dev(div0, "class", "form-check svelte-11iwgh3");
    			add_location(div0, file$6, 147, 12, 5794);
    			attr_dev(div1, "class", "svelte-11iwgh3");
    			add_location(div1, file$6, 146, 8, 5775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			/*input_binding*/ ctx[33](input);
    			append_dev(div0, t0);
    			append_dev(div0, label);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*editHighDiffPatternModifier*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_binding*/ ctx[33](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(146:4) {#if $routineState.type === \\\"team\\\"}",
    		ctx
    	});

    	return block;
    }

    // (165:16) <div slot="header">
    function create_header_slot$3(ctx) {
    	let div0;
    	let t0;
    	let t1_value = /*id*/ ctx[40] + 1 + "";
    	let t1;
    	let div1;
    	let t2_value = /*fragment*/ ctx[38].duration + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("№");
    			t1 = text(t1_value);
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = text(" sec.");
    			attr_dev(div0, "slot", "header");
    			attr_dev(div0, "class", "svelte-11iwgh3");
    			add_location(div0, file$6, 161, 16, 6507);
    			attr_dev(div1, "slot", "header");
    			attr_dev(div1, "class", "svelte-11iwgh3");
    			add_location(div1, file$6, 164, 16, 6597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$routineState*/ 4096 && t2_value !== (t2_value = /*fragment*/ ctx[38].duration + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot$3.name,
    		type: "slot",
    		source: "(165:16) <div slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (171:16) <div slot="body">
    function create_body_slot$3(ctx) {
    	let div0;
    	let t0_value = /*fragment*/ ctx[38].type + "";
    	let t0;
    	let div1;
    	let t1_value = /*fragment*/ ctx[38].startTime + "";
    	let t1;
    	let t2;
    	let t3_value = /*fragment*/ ctx[38].endTime + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = text(" - ");
    			t3 = text(t3_value);
    			attr_dev(div0, "slot", "body");
    			attr_dev(div0, "class", "svelte-11iwgh3");
    			add_location(div0, file$6, 167, 16, 6704);
    			attr_dev(div1, "slot", "body");
    			attr_dev(div1, "class", "svelte-11iwgh3");
    			add_location(div1, file$6, 170, 16, 6800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$routineState*/ 4096 && t0_value !== (t0_value = /*fragment*/ ctx[38].type + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$routineState*/ 4096 && t1_value !== (t1_value = /*fragment*/ ctx[38].startTime + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*$routineState*/ 4096 && t3_value !== (t3_value = /*fragment*/ ctx[38].endTime + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot$3.name,
    		type: "slot",
    		source: "(171:16) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    // (177:16) <div class="close-button" slot="footer" on:click={(event)=>{event.stopPropagation(); removeFragment(id)}}>
    function create_footer_slot$3(ctx) {
    	let div0;
    	let t0;
    	let t1_value = /*fragment*/ ctx[38].difficulty + "";
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[34](/*id*/ ctx[40], ...args);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Diff.: ");
    			t1 = text(t1_value);
    			div1 = element("div");
    			div1.textContent = "×";
    			attr_dev(div0, "slot", "footer");
    			attr_dev(div0, "class", "svelte-11iwgh3");
    			add_location(div0, file$6, 173, 16, 6922);
    			attr_dev(div1, "class", "close-button svelte-11iwgh3");
    			attr_dev(div1, "slot", "footer");
    			add_location(div1, file$6, 176, 16, 7033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$routineState*/ 4096 && t1_value !== (t1_value = /*fragment*/ ctx[38].difficulty + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot$3.name,
    		type: "slot",
    		source: "(177:16) <div class=\\\"close-button\\\" slot=\\\"footer\\\" on:click={(event)=>{event.stopPropagation(); removeFragment(id)}}>",
    		ctx
    	});

    	return block;
    }

    // (161:12) <Fragment on:click={()=>editFragment(fragment,id)}>
    function create_default_slot$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    			t4 = space();
    			t5 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(161:12) <Fragment on:click={()=>editFragment(fragment,id)}>",
    		ctx
    	});

    	return block;
    }

    // (160:8) {#each $routineState.fragments as fragment,id}
    function create_each_block$3(ctx) {
    	let fragment;
    	let current;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[35](/*fragment*/ ctx[38], /*id*/ ctx[40], ...args);
    	}

    	fragment = new Fragment({
    			props: {
    				$$slots: {
    					default: [create_default_slot$3],
    					footer: [create_footer_slot$3],
    					body: [create_body_slot$3],
    					header: [create_header_slot$3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	fragment.$on("click", click_handler_2);

    	const block = {
    		c: function create() {
    			create_component(fragment.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fragment, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const fragment_changes = {};

    			if (dirty[0] & /*$routineState*/ 4096 | dirty[1] & /*$$scope*/ 1024) {
    				fragment_changes.$$scope = { dirty, ctx };
    			}

    			fragment.$set(fragment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fragment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fragment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fragment, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(160:8) {#each $routineState.fragments as fragment,id}",
    		ctx
    	});

    	return block;
    }

    // (185:0) {#if fragmentModalVisibility}
    function create_if_block_2(ctx) {
    	let fragmentmodal;
    	let current;
    	fragmentmodal = new FragmentModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fragmentmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fragmentmodal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fragmentmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fragmentmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fragmentmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(185:0) {#if fragmentModalVisibility}",
    		ctx
    	});

    	return block;
    }

    // (188:0) {#if modifierModalVisibility}
    function create_if_block_1$2(ctx) {
    	let modifiermodal;
    	let current;
    	modifiermodal = new ModifiersModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(modifiermodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modifiermodal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modifiermodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modifiermodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modifiermodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(188:0) {#if modifierModalVisibility}",
    		ctx
    	});

    	return block;
    }

    // (191:0) {#if editFragmentModalVisibility}
    function create_if_block$2(ctx) {
    	let editfragmentmodal;
    	let current;

    	editfragmentmodal = new EditFragmentModal({
    			props: {
    				fragment: /*editingFragment*/ ctx[4],
    				index: /*editingFragmentIndex*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(editfragmentmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editfragmentmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editfragmentmodal_changes = {};
    			if (dirty[0] & /*editingFragment*/ 16) editfragmentmodal_changes.fragment = /*editingFragment*/ ctx[4];
    			if (dirty[0] & /*editingFragmentIndex*/ 32) editfragmentmodal_changes.index = /*editingFragmentIndex*/ ctx[5];
    			editfragmentmodal.$set(editfragmentmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editfragmentmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editfragmentmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editfragmentmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(191:0) {#if editFragmentModalVisibility}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div9;
    	let div2;
    	let label0;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t5;
    	let div1;
    	let t6;
    	let div0;
    	let button;
    	let t8;
    	let input0;
    	let t9;
    	let div3;
    	let label1;
    	let t10;
    	let input1;
    	let t11;
    	let label2;
    	let t12;
    	let input2;
    	let t13;
    	let div4;
    	let label3;
    	let t14;
    	let input3;
    	let t15;
    	let label4;
    	let t16;
    	let input4;
    	let t17;
    	let div7;
    	let div5;
    	let label5;
    	let t18;
    	let input5;
    	let t19;
    	let div6;
    	let label6;
    	let t20;
    	let input6;
    	let t21;
    	let t22;
    	let t23;
    	let div8;
    	let t24;
    	let t25;
    	let t26;
    	let t27;
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$routineState*/ ctx[12].type && create_if_block_4(ctx);
    	let if_block1 = /*$routineState*/ ctx[12].type === "team" && create_if_block_3(ctx);
    	let each_value = /*$routineState*/ ctx[12].fragments;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block2 = /*fragmentModalVisibility*/ ctx[0] && create_if_block_2(ctx);
    	let if_block3 = /*modifierModalVisibility*/ ctx[1] && create_if_block_1$2(ctx);
    	let if_block4 = /*editFragmentModalVisibility*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			t0 = text("Routine\r\n            ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			option1 = element("option");
    			option1.textContent = "Solo";
    			option2 = element("option");
    			option2.textContent = "Duet";
    			option3 = element("option");
    			option3.textContent = "Team";
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Load .asd file\r\n            ");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Press here to select .asd file from your computer";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			div3 = element("div");
    			label1 = element("label");
    			t10 = text("Country\r\n            ");
    			input1 = element("input");
    			t11 = space();
    			label2 = element("label");
    			t12 = text("Name of the athlete or team\r\n            ");
    			input2 = element("input");
    			t13 = space();
    			div4 = element("div");
    			label3 = element("label");
    			t14 = text("Name of the competition\r\n            ");
    			input3 = element("input");
    			t15 = space();
    			label4 = element("label");
    			t16 = text("Date\r\n            ");
    			input4 = element("input");
    			t17 = space();
    			div7 = element("div");
    			div5 = element("div");
    			label5 = element("label");
    			t18 = text("Duration\r\n                ");
    			input5 = element("input");
    			t19 = space();
    			div6 = element("div");
    			label6 = element("label");
    			t20 = text("Difficulty\r\n                ");
    			input6 = element("input");
    			t21 = space();
    			if (if_block0) if_block0.c();
    			t22 = space();
    			if (if_block1) if_block1.c();
    			t23 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t24 = space();
    			if (if_block2) if_block2.c();
    			t25 = space();
    			if (if_block3) if_block3.c();
    			t26 = space();
    			if (if_block4) if_block4.c();
    			t27 = space();
    			a = element("a");
    			a.textContent = " ";
    			option0.disabled = true;
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 87, 16, 3354);
    			option1.__value = "solo";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 88, 16, 3413);
    			option2.__value = "duet";
    			option2.value = option2.__value;
    			add_location(option2, file$6, 89, 16, 3465);
    			option3.__value = "team";
    			option3.value = option3.__value;
    			add_location(option3, file$6, 90, 16, 3517);
    			attr_dev(select, "class", "custom-select");
    			select.required = true;
    			if (/*$routineState*/ ctx[12].type === void 0) add_render_callback(() => /*select_change_handler*/ ctx[20].call(select));
    			add_location(select, file$6, 86, 12, 3243);
    			add_location(label0, file$6, 85, 8, 3215);
    			set_style(button, "width", "100%");
    			attr_dev(button, "class", "btn btn-outline-primary");
    			add_location(button, file$6, 95, 16, 3658);
    			attr_dev(div0, "class", "svelte-11iwgh3");
    			add_location(div0, file$6, 94, 12, 3635);
    			attr_dev(div1, "class", "svelte-11iwgh3");
    			add_location(div1, file$6, 93, 8, 3602);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "accept", ".asd");
    			input0.hidden = true;
    			attr_dev(input0, "class", "svelte-11iwgh3");
    			add_location(input0, file$6, 100, 8, 3895);
    			attr_dev(div2, "class", "row svelte-11iwgh3");
    			add_location(div2, file$6, 84, 4, 3188);
    			attr_dev(input1, "class", "form-control svelte-11iwgh3");
    			attr_dev(input1, "type", "text");
    			input1.required = true;
    			add_location(input1, file$6, 105, 12, 4067);
    			add_location(label1, file$6, 104, 8, 4039);
    			attr_dev(input2, "class", "form-control svelte-11iwgh3");
    			attr_dev(input2, "type", "text");
    			input2.required = true;
    			add_location(input2, file$6, 109, 12, 4272);
    			add_location(label2, file$6, 108, 8, 4224);
    			attr_dev(div3, "class", "row svelte-11iwgh3");
    			add_location(div3, file$6, 103, 4, 4012);
    			attr_dev(input3, "class", "form-control svelte-11iwgh3");
    			attr_dev(input3, "type", "text");
    			input3.required = true;
    			add_location(input3, file$6, 115, 12, 4484);
    			add_location(label3, file$6, 114, 8, 4440);
    			attr_dev(input4, "class", "form-control svelte-11iwgh3");
    			attr_dev(input4, "type", "date");
    			input4.required = true;
    			add_location(input4, file$6, 119, 12, 4674);
    			add_location(label4, file$6, 118, 8, 4649);
    			attr_dev(div4, "class", "row svelte-11iwgh3");
    			add_location(div4, file$6, 113, 4, 4413);
    			attr_dev(input5, "class", "form-control svelte-11iwgh3");
    			input5.disabled = true;
    			attr_dev(input5, "type", "text");
    			add_location(input5, file$6, 125, 16, 4892);
    			add_location(label5, file$6, 124, 12, 4859);
    			attr_dev(div5, "class", "svelte-11iwgh3");
    			add_location(div5, file$6, 123, 8, 4840);
    			attr_dev(input6, "class", "form-control svelte-11iwgh3");
    			input6.disabled = true;
    			attr_dev(input6, "type", "text");
    			add_location(input6, file$6, 130, 16, 5079);
    			add_location(label6, file$6, 129, 12, 5044);
    			attr_dev(div6, "class", "svelte-11iwgh3");
    			add_location(div6, file$6, 128, 8, 5025);
    			attr_dev(div7, "class", "row svelte-11iwgh3");
    			add_location(div7, file$6, 122, 4, 4813);
    			attr_dev(div8, "class", "fragments svelte-11iwgh3");
    			add_location(div8, file$6, 158, 4, 6345);
    			attr_dev(div9, "class", "container svelte-11iwgh3");
    			add_location(div9, file$6, 83, 0, 3159);
    			attr_dev(a, "id", "downloadAnchorElem");
    			set_style(a, "display", "none");
    			add_location(a, file$6, 194, 0, 7504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div2);
    			append_dev(div2, label0);
    			append_dev(label0, t0);
    			append_dev(label0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			/*select_binding*/ ctx[19](select);
    			select_option(select, /*$routineState*/ ctx[12].type);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div2, t8);
    			append_dev(div2, input0);
    			/*input0_binding*/ ctx[22](input0);
    			append_dev(div9, t9);
    			append_dev(div9, div3);
    			append_dev(div3, label1);
    			append_dev(label1, t10);
    			append_dev(label1, input1);
    			/*input1_binding*/ ctx[23](input1);
    			set_input_value(input1, /*$routineState*/ ctx[12].country);
    			append_dev(div3, t11);
    			append_dev(div3, label2);
    			append_dev(label2, t12);
    			append_dev(label2, input2);
    			/*input2_binding*/ ctx[25](input2);
    			set_input_value(input2, /*$routineState*/ ctx[12].name);
    			append_dev(div9, t13);
    			append_dev(div9, div4);
    			append_dev(div4, label3);
    			append_dev(label3, t14);
    			append_dev(label3, input3);
    			/*input3_binding*/ ctx[27](input3);
    			set_input_value(input3, /*$routineState*/ ctx[12].competition);
    			append_dev(div4, t15);
    			append_dev(div4, label4);
    			append_dev(label4, t16);
    			append_dev(label4, input4);
    			/*input4_binding*/ ctx[29](input4);
    			set_input_value(input4, /*$routineState*/ ctx[12].date);
    			append_dev(div9, t17);
    			append_dev(div9, div7);
    			append_dev(div7, div5);
    			append_dev(div5, label5);
    			append_dev(label5, t18);
    			append_dev(label5, input5);
    			set_input_value(input5, /*$routineState*/ ctx[12].duration);
    			append_dev(div7, t19);
    			append_dev(div7, div6);
    			append_dev(div6, label6);
    			append_dev(label6, t20);
    			append_dev(label6, input6);
    			set_input_value(input6, /*$routineState*/ ctx[12].mark);
    			append_dev(div9, t21);
    			if (if_block0) if_block0.m(div9, null);
    			append_dev(div9, t22);
    			if (if_block1) if_block1.m(div9, null);
    			append_dev(div9, t23);
    			append_dev(div9, div8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			insert_dev(target, t24, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t25, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t26, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, a, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[20]),
    					listen_dev(button, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(input0, "change", /*loadFile*/ ctx[18], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[24]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[26]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[28]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[30]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[31]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[32])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$routineState*/ 4096) {
    				select_option(select, /*$routineState*/ ctx[12].type);
    			}

    			if (dirty[0] & /*$routineState*/ 4096 && input1.value !== /*$routineState*/ ctx[12].country) {
    				set_input_value(input1, /*$routineState*/ ctx[12].country);
    			}

    			if (dirty[0] & /*$routineState*/ 4096 && input2.value !== /*$routineState*/ ctx[12].name) {
    				set_input_value(input2, /*$routineState*/ ctx[12].name);
    			}

    			if (dirty[0] & /*$routineState*/ 4096 && input3.value !== /*$routineState*/ ctx[12].competition) {
    				set_input_value(input3, /*$routineState*/ ctx[12].competition);
    			}

    			if (dirty[0] & /*$routineState*/ 4096) {
    				set_input_value(input4, /*$routineState*/ ctx[12].date);
    			}

    			if (dirty[0] & /*$routineState*/ 4096 && input5.value !== /*$routineState*/ ctx[12].duration) {
    				set_input_value(input5, /*$routineState*/ ctx[12].duration);
    			}

    			if (dirty[0] & /*$routineState*/ 4096 && input6.value !== /*$routineState*/ ctx[12].mark) {
    				set_input_value(input6, /*$routineState*/ ctx[12].mark);
    			}

    			if (/*$routineState*/ ctx[12].type) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div9, t22);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$routineState*/ ctx[12].type === "team") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div9, t23);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*editFragment, $routineState, removeFragment*/ 102400) {
    				each_value = /*$routineState*/ ctx[12].fragments;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div8, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*fragmentModalVisibility*/ ctx[0]) {
    				if (if_block2) {
    					if (dirty[0] & /*fragmentModalVisibility*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t25.parentNode, t25);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*modifierModalVisibility*/ ctx[1]) {
    				if (if_block3) {
    					if (dirty[0] & /*modifierModalVisibility*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t26.parentNode, t26);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*editFragmentModalVisibility*/ ctx[2]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*editFragmentModalVisibility*/ 4) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$2(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t27.parentNode, t27);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			/*select_binding*/ ctx[19](null);
    			/*input0_binding*/ ctx[22](null);
    			/*input1_binding*/ ctx[23](null);
    			/*input2_binding*/ ctx[25](null);
    			/*input3_binding*/ ctx[27](null);
    			/*input4_binding*/ ctx[29](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t24);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t25);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t26);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $routineState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(12, $routineState = $$value));
    	let fragmentModalVisibility;
    	let modifierModalVisibility;
    	let editFragmentModalVisibility;
    	let inputHighDiffPatternModifier;
    	let routineUniqueModifiers;
    	let editingFragment;
    	let editingFragmentIndex;
    	let inputFile;
    	let inputName;
    	let inputType;
    	let inputCountry;
    	let inputCompetition;
    	let inputDate;

    	onMount(async () => {
    		routineUniqueModifiers = await fetch("./routine_unique_modifiers.json").then(res => res.json());
    	});

    	let modals = modalStates.subscribe(state => {
    		$$invalidate(0, fragmentModalVisibility = state.fragmentModalVisibility);
    		$$invalidate(1, modifierModalVisibility = state.modifierModalVisibility);
    		$$invalidate(2, editFragmentModalVisibility = state.editFragmentModalVisibility);
    	});

    	let printForm = function () {
    		if (inputName.reportValidity() && inputType.reportValidity() && inputCountry.reportValidity() && inputCompetition.reportValidity() && inputDate.reportValidity()) {
    			window.print();
    		}
    	};

    	let editHighDiffPatternModifier = function () {
    		console.log($routineState);

    		if (inputHighDiffPatternModifier.checked) {
    			set_store_value(routineState, $routineState.unique_modifiers = [routineUniqueModifiers[0]], $routineState);
    		} else {
    			set_store_value(routineState, $routineState.unique_modifiers = [], $routineState);
    		}

    		set_store_value(routineState, $routineState.mark = calculateRoutineDifficulty($routineState), $routineState);
    	};

    	let removeFragment = function (index) {
    		set_store_value(
    			routineState,
    			$routineState.fragments = [
    				...$routineState.fragments.slice(0, index),
    				...$routineState.fragments.slice(index + 1)
    			],
    			$routineState
    		);

    		set_store_value(routineState, $routineState.mark = calculateRoutineDifficulty($routineState), $routineState);
    		set_store_value(routineState, $routineState.duration = calculateRoutineTime($routineState), $routineState);
    	};

    	let editFragment = function (fragment, index) {
    		$$invalidate(4, editingFragment = fragment);
    		$$invalidate(5, editingFragmentIndex = index);
    		showEditFragmentModal();
    	};

    	let saveDataset = function () {
    		let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($routineState));
    		let dlAnchorElem = document.getElementById("downloadAnchorElem");
    		dlAnchorElem.setAttribute("href", dataStr);
    		dlAnchorElem.setAttribute("download", `${$routineState.type}_${$routineState.country}_${$routineState.name}.asd`);
    		dlAnchorElem.click();
    	};

    	let loadFile = function () {
    		let reader = new FileReader();
    		let data;

    		reader.addEventListener("load", event => {
    			data = event.target.result;
    			routineState.set(JSON.parse(data));
    		});

    		reader.readAsText(inputFile.files[0]);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Main", $$slots, []);

    	function select_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputType = $$value;
    			$$invalidate(8, inputType);
    		});
    	}

    	function select_change_handler() {
    		$routineState.type = select_value(this);
    		routineState.set($routineState);
    	}

    	const click_handler = () => inputFile.click();

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputFile = $$value;
    			$$invalidate(6, inputFile);
    		});
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputCountry = $$value;
    			$$invalidate(9, inputCountry);
    		});
    	}

    	function input1_input_handler() {
    		$routineState.country = this.value;
    		routineState.set($routineState);
    	}

    	function input2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputName = $$value;
    			$$invalidate(7, inputName);
    		});
    	}

    	function input2_input_handler() {
    		$routineState.name = this.value;
    		routineState.set($routineState);
    	}

    	function input3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputCompetition = $$value;
    			$$invalidate(10, inputCompetition);
    		});
    	}

    	function input3_input_handler() {
    		$routineState.competition = this.value;
    		routineState.set($routineState);
    	}

    	function input4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputDate = $$value;
    			$$invalidate(11, inputDate);
    		});
    	}

    	function input4_input_handler() {
    		$routineState.date = this.value;
    		routineState.set($routineState);
    	}

    	function input5_input_handler() {
    		$routineState.duration = this.value;
    		routineState.set($routineState);
    	}

    	function input6_input_handler() {
    		$routineState.mark = this.value;
    		routineState.set($routineState);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputHighDiffPatternModifier = $$value;
    			$$invalidate(3, inputHighDiffPatternModifier);
    		});
    	}

    	const click_handler_1 = (id, event) => {
    		event.stopPropagation();
    		removeFragment(id);
    	};

    	const click_handler_2 = (fragment, id) => editFragment(fragment, id);

    	$$self.$capture_state = () => ({
    		onMount,
    		modalStates,
    		routineState,
    		calculateRoutineDifficulty,
    		calculateRoutineTime,
    		showFragmentModal,
    		showEditFragmentModal,
    		FragmentModal,
    		ModifierModal: ModifiersModal,
    		EditFragmentModal,
    		Fragment,
    		fragmentModalVisibility,
    		modifierModalVisibility,
    		editFragmentModalVisibility,
    		inputHighDiffPatternModifier,
    		routineUniqueModifiers,
    		editingFragment,
    		editingFragmentIndex,
    		inputFile,
    		inputName,
    		inputType,
    		inputCountry,
    		inputCompetition,
    		inputDate,
    		modals,
    		printForm,
    		editHighDiffPatternModifier,
    		removeFragment,
    		editFragment,
    		saveDataset,
    		loadFile,
    		$routineState
    	});

    	$$self.$inject_state = $$props => {
    		if ("fragmentModalVisibility" in $$props) $$invalidate(0, fragmentModalVisibility = $$props.fragmentModalVisibility);
    		if ("modifierModalVisibility" in $$props) $$invalidate(1, modifierModalVisibility = $$props.modifierModalVisibility);
    		if ("editFragmentModalVisibility" in $$props) $$invalidate(2, editFragmentModalVisibility = $$props.editFragmentModalVisibility);
    		if ("inputHighDiffPatternModifier" in $$props) $$invalidate(3, inputHighDiffPatternModifier = $$props.inputHighDiffPatternModifier);
    		if ("routineUniqueModifiers" in $$props) routineUniqueModifiers = $$props.routineUniqueModifiers;
    		if ("editingFragment" in $$props) $$invalidate(4, editingFragment = $$props.editingFragment);
    		if ("editingFragmentIndex" in $$props) $$invalidate(5, editingFragmentIndex = $$props.editingFragmentIndex);
    		if ("inputFile" in $$props) $$invalidate(6, inputFile = $$props.inputFile);
    		if ("inputName" in $$props) $$invalidate(7, inputName = $$props.inputName);
    		if ("inputType" in $$props) $$invalidate(8, inputType = $$props.inputType);
    		if ("inputCountry" in $$props) $$invalidate(9, inputCountry = $$props.inputCountry);
    		if ("inputCompetition" in $$props) $$invalidate(10, inputCompetition = $$props.inputCompetition);
    		if ("inputDate" in $$props) $$invalidate(11, inputDate = $$props.inputDate);
    		if ("modals" in $$props) modals = $$props.modals;
    		if ("printForm" in $$props) $$invalidate(13, printForm = $$props.printForm);
    		if ("editHighDiffPatternModifier" in $$props) $$invalidate(14, editHighDiffPatternModifier = $$props.editHighDiffPatternModifier);
    		if ("removeFragment" in $$props) $$invalidate(15, removeFragment = $$props.removeFragment);
    		if ("editFragment" in $$props) $$invalidate(16, editFragment = $$props.editFragment);
    		if ("saveDataset" in $$props) $$invalidate(17, saveDataset = $$props.saveDataset);
    		if ("loadFile" in $$props) $$invalidate(18, loadFile = $$props.loadFile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fragmentModalVisibility,
    		modifierModalVisibility,
    		editFragmentModalVisibility,
    		inputHighDiffPatternModifier,
    		editingFragment,
    		editingFragmentIndex,
    		inputFile,
    		inputName,
    		inputType,
    		inputCountry,
    		inputCompetition,
    		inputDate,
    		$routineState,
    		printForm,
    		editHighDiffPatternModifier,
    		removeFragment,
    		editFragment,
    		saveDataset,
    		loadFile,
    		select_binding,
    		select_change_handler,
    		click_handler,
    		input0_binding,
    		input1_binding,
    		input1_input_handler,
    		input2_binding,
    		input2_input_handler,
    		input3_binding,
    		input3_input_handler,
    		input4_binding,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input_binding,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Print\Head.svelte generated by Svelte v3.23.2 */
    const file$7 = "src\\Print\\Head.svelte";

    function create_fragment$7(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th;
    	let t1;
    	let tbody;
    	let tr1;
    	let td0;
    	let t3;
    	let td1;
    	let t4_value = /*$routineState*/ ctx[0].type + "";
    	let t4;
    	let t5;
    	let td2;
    	let t7;
    	let td3;
    	let t8_value = /*$routineState*/ ctx[0].competition + "";
    	let t8;
    	let t9;
    	let tr2;
    	let td4;
    	let t11;
    	let td5;
    	let t12_value = /*$routineState*/ ctx[0].country + "";
    	let t12;
    	let t13;
    	let td6;
    	let t15;
    	let td7;
    	let t16_value = /*$routineState*/ ctx[0].date + "";
    	let t16;
    	let t17;
    	let tr3;
    	let td8;
    	let t19;
    	let td9;
    	let t20_value = /*$routineState*/ ctx[0].name + "";
    	let t20;
    	let t21;
    	let td10;
    	let t23;
    	let td11;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th = element("th");
    			th.textContent = "ARTISTIC SWIMMING DIFFICULTY FORM";
    			t1 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "EVENT:";
    			t3 = space();
    			td1 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td2 = element("td");
    			td2.textContent = "PLACE:";
    			t7 = space();
    			td3 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "COUNTRY:";
    			t11 = space();
    			td5 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td6 = element("td");
    			td6.textContent = "DATE:";
    			t15 = space();
    			td7 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			tr3 = element("tr");
    			td8 = element("td");
    			td8.textContent = "NAME:";
    			t19 = space();
    			td9 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td10 = element("td");
    			td10.textContent = "Start List №";
    			t23 = space();
    			td11 = element("td");
    			attr_dev(th, "colspan", "5");
    			set_style(th, "width", "17cm");
    			set_style(th, "border", "1px solid black");
    			add_location(th, file$7, 7, 8, 129);
    			add_location(tr0, file$7, 6, 4, 115);
    			add_location(thead, file$7, 5, 4, 102);
    			attr_dev(td0, "class", "text-left w-3 svelte-1lql2pk");
    			add_location(td0, file$7, 12, 8, 286);
    			attr_dev(td1, "class", "border text-left w-1 text-bold uppercase svelte-1lql2pk");
    			add_location(td1, file$7, 13, 8, 333);
    			attr_dev(td2, "class", "text-right w-3 svelte-1lql2pk");
    			add_location(td2, file$7, 14, 8, 421);
    			attr_dev(td3, "class", "border text-left w-5 text-bold svelte-1lql2pk");
    			add_location(td3, file$7, 15, 8, 469);
    			add_location(tr1, file$7, 11, 4, 272);
    			attr_dev(td4, "class", "text-left w-3 svelte-1lql2pk");
    			add_location(td4, file$7, 18, 8, 575);
    			attr_dev(td5, "class", "border text-left w-1 text-bold uppercase svelte-1lql2pk");
    			add_location(td5, file$7, 19, 8, 624);
    			attr_dev(td6, "class", "text-right w-3 svelte-1lql2pk");
    			add_location(td6, file$7, 20, 8, 715);
    			attr_dev(td7, "class", "border text-left w-5 text-bold svelte-1lql2pk");
    			add_location(td7, file$7, 21, 8, 762);
    			add_location(tr2, file$7, 17, 4, 561);
    			attr_dev(td8, "class", "text-left w-3 svelte-1lql2pk");
    			add_location(td8, file$7, 24, 8, 861);
    			attr_dev(td9, "class", "border text-left w-5 text-bold svelte-1lql2pk");
    			add_location(td9, file$7, 25, 8, 907);
    			attr_dev(td10, "class", "text-right w-3 svelte-1lql2pk");
    			add_location(td10, file$7, 26, 8, 985);
    			attr_dev(td11, "class", "border text-left w-5 text-bold svelte-1lql2pk");
    			add_location(td11, file$7, 27, 8, 1039);
    			add_location(tr3, file$7, 23, 4, 847);
    			add_location(tbody, file$7, 10, 4, 259);
    			attr_dev(table, "class", "collapse w-17 svelte-1lql2pk");
    			add_location(table, file$7, 4, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th);
    			append_dev(table, t1);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t3);
    			append_dev(tr1, td1);
    			append_dev(td1, t4);
    			append_dev(tr1, t5);
    			append_dev(tr1, td2);
    			append_dev(tr1, t7);
    			append_dev(tr1, td3);
    			append_dev(td3, t8);
    			append_dev(tbody, t9);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t11);
    			append_dev(tr2, td5);
    			append_dev(td5, t12);
    			append_dev(tr2, t13);
    			append_dev(tr2, td6);
    			append_dev(tr2, t15);
    			append_dev(tr2, td7);
    			append_dev(td7, t16);
    			append_dev(tbody, t17);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td8);
    			append_dev(tr3, t19);
    			append_dev(tr3, td9);
    			append_dev(td9, t20);
    			append_dev(tr3, t21);
    			append_dev(tr3, td10);
    			append_dev(tr3, t23);
    			append_dev(tr3, td11);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$routineState*/ 1 && t4_value !== (t4_value = /*$routineState*/ ctx[0].type + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$routineState*/ 1 && t8_value !== (t8_value = /*$routineState*/ ctx[0].competition + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$routineState*/ 1 && t12_value !== (t12_value = /*$routineState*/ ctx[0].country + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*$routineState*/ 1 && t16_value !== (t16_value = /*$routineState*/ ctx[0].date + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*$routineState*/ 1 && t20_value !== (t20_value = /*$routineState*/ ctx[0].name + "")) set_data_dev(t20, t20_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $routineState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(0, $routineState = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Head> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Head", $$slots, []);
    	$$self.$capture_state = () => ({ routineState, $routineState });
    	return [$routineState];
    }

    class Head extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Head",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Print\Total.svelte generated by Svelte v3.23.2 */
    const file$8 = "src\\Print\\Total.svelte";

    function create_fragment$8(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let td0;
    	let t1;
    	let td1;
    	let t2_value = /*$routineState*/ ctx[0].mark + "";
    	let t2;
    	let t3;
    	let tr1;
    	let td2;
    	let t5;
    	let td3;
    	let t6_value = /*$routineState*/ ctx[0].duration + "";
    	let t6;
    	let t7;
    	let tr2;
    	let td4;
    	let t9;
    	let td5;
    	let t10_value = /*$routineState*/ ctx[0].hybridsTime + "";
    	let t10;
    	let t11;
    	let tr3;
    	let td6;
    	let t13;
    	let td7;
    	let t14_value = /*$routineState*/ ctx[0].hybridsPercent + "";
    	let t14;
    	let t15;
    	let tr4;
    	let td8;
    	let t17;
    	let td9;
    	let t18_value = /*$routineState*/ ctx[0].hybridsScore + "";
    	let t18;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "TOTAL DIFF:";
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "TOTAL TIME:";
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "HYBRIDS TIME:";
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "HYBRIDS PERCENT:";
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			tr4 = element("tr");
    			td8 = element("td");
    			td8.textContent = "HYBRIDS SCORE:";
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			attr_dev(td0, "class", "w-3 border text-bold svelte-1ekydx2");
    			add_location(td0, file$8, 7, 8, 138);
    			attr_dev(td1, "class", "w-2 border svelte-1ekydx2");
    			add_location(td1, file$8, 8, 8, 197);
    			add_location(tr0, file$8, 6, 4, 124);
    			attr_dev(td2, "class", "w-3 border text-bold svelte-1ekydx2");
    			add_location(td2, file$8, 11, 8, 276);
    			attr_dev(td3, "class", "w-2 border svelte-1ekydx2");
    			add_location(td3, file$8, 12, 8, 335);
    			add_location(tr1, file$8, 10, 4, 262);
    			attr_dev(td4, "class", "w-3 border text-bold svelte-1ekydx2");
    			add_location(td4, file$8, 15, 8, 418);
    			attr_dev(td5, "class", "w-2 border svelte-1ekydx2");
    			add_location(td5, file$8, 16, 8, 479);
    			add_location(tr2, file$8, 14, 4, 404);
    			attr_dev(td6, "class", "w-3 border text-bold svelte-1ekydx2");
    			add_location(td6, file$8, 19, 8, 565);
    			attr_dev(td7, "class", "w-2 border svelte-1ekydx2");
    			add_location(td7, file$8, 20, 8, 629);
    			add_location(tr3, file$8, 18, 4, 551);
    			attr_dev(td8, "class", "w-3 border text-bold svelte-1ekydx2");
    			add_location(td8, file$8, 23, 8, 718);
    			attr_dev(td9, "class", "w-2 border svelte-1ekydx2");
    			add_location(td9, file$8, 24, 8, 780);
    			add_location(tr4, file$8, 22, 4, 704);
    			add_location(thead, file$8, 5, 4, 111);
    			attr_dev(table, "class", "w-5 m-default collapse svelte-1ekydx2");
    			add_location(table, file$8, 4, 0, 67);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, t2);
    			append_dev(thead, t3);
    			append_dev(thead, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t5);
    			append_dev(tr1, td3);
    			append_dev(td3, t6);
    			append_dev(thead, t7);
    			append_dev(thead, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t9);
    			append_dev(tr2, td5);
    			append_dev(td5, t10);
    			append_dev(thead, t11);
    			append_dev(thead, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t13);
    			append_dev(tr3, td7);
    			append_dev(td7, t14);
    			append_dev(thead, t15);
    			append_dev(thead, tr4);
    			append_dev(tr4, td8);
    			append_dev(tr4, t17);
    			append_dev(tr4, td9);
    			append_dev(td9, t18);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$routineState*/ 1 && t2_value !== (t2_value = /*$routineState*/ ctx[0].mark + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$routineState*/ 1 && t6_value !== (t6_value = /*$routineState*/ ctx[0].duration + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$routineState*/ 1 && t10_value !== (t10_value = /*$routineState*/ ctx[0].hybridsTime + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*$routineState*/ 1 && t14_value !== (t14_value = /*$routineState*/ ctx[0].hybridsPercent + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*$routineState*/ 1 && t18_value !== (t18_value = /*$routineState*/ ctx[0].hybridsScore + "")) set_data_dev(t18, t18_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $routineState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(0, $routineState = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Total> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Total", $$slots, []);
    	$$self.$capture_state = () => ({ routineState, $routineState });
    	return [$routineState];
    }

    class Total extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Total",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\Print\Modifier.svelte generated by Svelte v3.23.2 */
    const file$9 = "src\\Print\\Modifier.svelte";

    function create_fragment$9(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*modifier*/ ctx[0].category + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*modifier*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*modifier*/ ctx[0].values[/*$routineState*/ ctx[1].type] + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6;
    	let td4;
    	let t7;
    	let td5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = space();
    			td4 = element("td");
    			t7 = space();
    			td5 = element("td");
    			attr_dev(td0, "colspan", "2");
    			attr_dev(td0, "class", "border svelte-1d6fe9x");
    			add_location(td0, file$9, 7, 4, 104);
    			attr_dev(td1, "colspan", "2");
    			attr_dev(td1, "class", "border svelte-1d6fe9x");
    			add_location(td1, file$9, 8, 4, 165);
    			attr_dev(td2, "class", "border svelte-1d6fe9x");
    			add_location(td2, file$9, 9, 4, 222);
    			attr_dev(td3, "class", "border svelte-1d6fe9x");
    			add_location(td3, file$9, 10, 4, 289);
    			attr_dev(td4, "class", "border svelte-1d6fe9x");
    			add_location(td4, file$9, 11, 4, 319);
    			attr_dev(td5, "class", "border svelte-1d6fe9x");
    			add_location(td5, file$9, 12, 4, 349);
    			add_location(tr, file$9, 6, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			append_dev(tr, t7);
    			append_dev(tr, td5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*modifier*/ 1 && t0_value !== (t0_value = /*modifier*/ ctx[0].category + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*modifier*/ 1 && t2_value !== (t2_value = /*modifier*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*modifier, $routineState*/ 3 && t4_value !== (t4_value = /*modifier*/ ctx[0].values[/*$routineState*/ ctx[1].type] + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $routineState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(1, $routineState = $$value));
    	let { modifier } = $$props;
    	const writable_props = ["modifier"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modifier> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modifier", $$slots, []);

    	$$self.$set = $$props => {
    		if ("modifier" in $$props) $$invalidate(0, modifier = $$props.modifier);
    	};

    	$$self.$capture_state = () => ({ routineState, modifier, $routineState });

    	$$self.$inject_state = $$props => {
    		if ("modifier" in $$props) $$invalidate(0, modifier = $$props.modifier);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modifier, $routineState];
    }

    class Modifier$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { modifier: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modifier",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*modifier*/ ctx[0] === undefined && !("modifier" in props)) {
    			console.warn("<Modifier> was created without expected prop 'modifier'");
    		}
    	}

    	get modifier() {
    		throw new Error("<Modifier>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modifier(value) {
    		throw new Error("<Modifier>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Print\Fragment.svelte generated by Svelte v3.23.2 */
    const file$a = "src\\Print\\Fragment.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (16:0) {#if fragment.type==="hybrid"}
    function create_if_block$3(ctx) {
    	let tr0;
    	let td0;
    	let t0;
    	let td1;
    	let t1;
    	let td2;
    	let t3;
    	let td3;
    	let t4_value = /*fragment*/ ctx[0].level + "";
    	let t4;
    	let t5;
    	let td4;
    	let t6;
    	let td5;
    	let t7;
    	let td6;
    	let t8;
    	let td7;
    	let t9;
    	let tr1;
    	let td8;
    	let t10;
    	let td9;
    	let t11;
    	let td10;
    	let t13;
    	let td11;
    	let t14_value = /*fragment*/ ctx[0].numberOfMovements + "";
    	let t14;
    	let t15;
    	let td12;
    	let t16;
    	let td13;
    	let t17;
    	let td14;
    	let t18;
    	let td15;
    	let t19;
    	let tr2;
    	let td16;
    	let t20;
    	let td17;
    	let t21;
    	let td18;
    	let t23;
    	let td19;
    	let t24_value = /*fragment*/ ctx[0].legs + "";
    	let t24;
    	let t25;
    	let t26;
    	let td20;
    	let t27_value = /*fragment*/ ctx[0].basicMark + "";
    	let t27;
    	let t28;
    	let td21;
    	let t29;
    	let td22;
    	let t30;
    	let td23;

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			t0 = space();
    			td1 = element("td");
    			t1 = space();
    			td2 = element("td");
    			td2.textContent = "Level";
    			t3 = space();
    			td3 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td4 = element("td");
    			t6 = space();
    			td5 = element("td");
    			t7 = space();
    			td6 = element("td");
    			t8 = space();
    			td7 = element("td");
    			t9 = space();
    			tr1 = element("tr");
    			td8 = element("td");
    			t10 = space();
    			td9 = element("td");
    			t11 = space();
    			td10 = element("td");
    			td10.textContent = "Movements";
    			t13 = space();
    			td11 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td12 = element("td");
    			t16 = space();
    			td13 = element("td");
    			t17 = space();
    			td14 = element("td");
    			t18 = space();
    			td15 = element("td");
    			t19 = space();
    			tr2 = element("tr");
    			td16 = element("td");
    			t20 = space();
    			td17 = element("td");
    			t21 = space();
    			td18 = element("td");
    			td18.textContent = "Basic Mark";
    			t23 = space();
    			td19 = element("td");
    			t24 = text(t24_value);
    			t25 = text(" legs");
    			t26 = space();
    			td20 = element("td");
    			t27 = text(t27_value);
    			t28 = space();
    			td21 = element("td");
    			t29 = space();
    			td22 = element("td");
    			t30 = space();
    			td23 = element("td");
    			add_location(td0, file$a, 17, 8, 586);
    			add_location(td1, file$a, 18, 8, 605);
    			attr_dev(td2, "class", "border capitalize text-bold svelte-18lr8ft");
    			add_location(td2, file$a, 19, 8, 624);
    			attr_dev(td3, "class", "border capitalize svelte-18lr8ft");
    			add_location(td3, file$a, 20, 8, 684);
    			attr_dev(td4, "class", "border svelte-18lr8ft");
    			add_location(td4, file$a, 21, 8, 745);
    			attr_dev(td5, "class", "border svelte-18lr8ft");
    			add_location(td5, file$a, 22, 8, 779);
    			attr_dev(td6, "class", "border svelte-18lr8ft");
    			add_location(td6, file$a, 23, 8, 813);
    			attr_dev(td7, "class", "border svelte-18lr8ft");
    			add_location(td7, file$a, 24, 8, 847);
    			add_location(tr0, file$a, 16, 4, 572);
    			add_location(td8, file$a, 27, 8, 902);
    			add_location(td9, file$a, 28, 8, 921);
    			attr_dev(td10, "class", "border capitalize text-bold svelte-18lr8ft");
    			add_location(td10, file$a, 29, 8, 940);
    			attr_dev(td11, "class", "border capitalize svelte-18lr8ft");
    			add_location(td11, file$a, 30, 8, 1004);
    			attr_dev(td12, "class", "border svelte-18lr8ft");
    			add_location(td12, file$a, 31, 8, 1077);
    			attr_dev(td13, "class", "border svelte-18lr8ft");
    			add_location(td13, file$a, 32, 8, 1111);
    			attr_dev(td14, "class", "border svelte-18lr8ft");
    			add_location(td14, file$a, 33, 8, 1145);
    			attr_dev(td15, "class", "border svelte-18lr8ft");
    			add_location(td15, file$a, 34, 8, 1179);
    			add_location(tr1, file$a, 26, 4, 888);
    			add_location(td16, file$a, 37, 8, 1234);
    			add_location(td17, file$a, 38, 8, 1253);
    			attr_dev(td18, "class", "border capitalize text-bold svelte-18lr8ft");
    			add_location(td18, file$a, 39, 8, 1272);
    			attr_dev(td19, "class", "border capitalize svelte-18lr8ft");
    			add_location(td19, file$a, 40, 8, 1337);
    			attr_dev(td20, "class", "border svelte-18lr8ft");
    			add_location(td20, file$a, 41, 8, 1402);
    			attr_dev(td21, "class", "border svelte-18lr8ft");
    			add_location(td21, file$a, 42, 8, 1456);
    			attr_dev(td22, "class", "border svelte-18lr8ft");
    			add_location(td22, file$a, 43, 8, 1490);
    			attr_dev(td23, "class", "border svelte-18lr8ft");
    			add_location(td23, file$a, 44, 8, 1524);
    			add_location(tr2, file$a, 36, 4, 1220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(tr0, t0);
    			append_dev(tr0, td1);
    			append_dev(tr0, t1);
    			append_dev(tr0, td2);
    			append_dev(tr0, t3);
    			append_dev(tr0, td3);
    			append_dev(td3, t4);
    			append_dev(tr0, t5);
    			append_dev(tr0, td4);
    			append_dev(tr0, t6);
    			append_dev(tr0, td5);
    			append_dev(tr0, t7);
    			append_dev(tr0, td6);
    			append_dev(tr0, t8);
    			append_dev(tr0, td7);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td8);
    			append_dev(tr1, t10);
    			append_dev(tr1, td9);
    			append_dev(tr1, t11);
    			append_dev(tr1, td10);
    			append_dev(tr1, t13);
    			append_dev(tr1, td11);
    			append_dev(td11, t14);
    			append_dev(tr1, t15);
    			append_dev(tr1, td12);
    			append_dev(tr1, t16);
    			append_dev(tr1, td13);
    			append_dev(tr1, t17);
    			append_dev(tr1, td14);
    			append_dev(tr1, t18);
    			append_dev(tr1, td15);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, tr2, anchor);
    			append_dev(tr2, td16);
    			append_dev(tr2, t20);
    			append_dev(tr2, td17);
    			append_dev(tr2, t21);
    			append_dev(tr2, td18);
    			append_dev(tr2, t23);
    			append_dev(tr2, td19);
    			append_dev(td19, t24);
    			append_dev(td19, t25);
    			append_dev(tr2, t26);
    			append_dev(tr2, td20);
    			append_dev(td20, t27);
    			append_dev(tr2, t28);
    			append_dev(tr2, td21);
    			append_dev(tr2, t29);
    			append_dev(tr2, td22);
    			append_dev(tr2, t30);
    			append_dev(tr2, td23);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fragment*/ 1 && t4_value !== (t4_value = /*fragment*/ ctx[0].level + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*fragment*/ 1 && t14_value !== (t14_value = /*fragment*/ ctx[0].numberOfMovements + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*fragment*/ 1 && t24_value !== (t24_value = /*fragment*/ ctx[0].legs + "")) set_data_dev(t24, t24_value);
    			if (dirty & /*fragment*/ 1 && t27_value !== (t27_value = /*fragment*/ ctx[0].basicMark + "")) set_data_dev(t27, t27_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(tr1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(tr2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(16:0) {#if fragment.type===\\\"hybrid\\\"}",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#each fragment.modifiers as modifier}
    function create_each_block$4(ctx) {
    	let modifier;
    	let current;

    	modifier = new Modifier$1({
    			props: { modifier: /*modifier*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modifier.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modifier, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modifier_changes = {};
    			if (dirty & /*fragment*/ 1) modifier_changes.modifier = /*modifier*/ ctx[1];
    			modifier.$set(modifier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modifier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modifier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modifier, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(48:0) {#each fragment.modifiers as modifier}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*fragment*/ ctx[0].startTime + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*fragment*/ ctx[0].endTime + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*fragment*/ ctx[0].duration + "";
    	let t4;
    	let t5;
    	let t6;
    	let td3;
    	let t7_value = /*fragment*/ ctx[0].type + "";
    	let t7;
    	let t8;
    	let td4;
    	let t9_value = /*fragment*/ ctx[0].difficulty + "";
    	let t9;
    	let t10;
    	let td5;
    	let t11;
    	let td6;
    	let t12;
    	let td7;
    	let t13;
    	let t14;
    	let each_1_anchor;
    	let current;
    	let if_block = /*fragment*/ ctx[0].type === "hybrid" && create_if_block$3(ctx);
    	let each_value = /*fragment*/ ctx[0].modifiers;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = text(" sec.");
    			t6 = space();
    			td3 = element("td");
    			t7 = text(t7_value);
    			t8 = space();
    			td4 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			td5 = element("td");
    			t11 = space();
    			td6 = element("td");
    			t12 = space();
    			td7 = element("td");
    			t13 = space();
    			if (if_block) if_block.c();
    			t14 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(td0, "class", "border shade text-bold svelte-18lr8ft");
    			add_location(td0, file$a, 6, 4, 104);
    			attr_dev(td1, "class", "border shade text-bold svelte-18lr8ft");
    			add_location(td1, file$a, 7, 4, 170);
    			attr_dev(td2, "class", "border shade text-bold svelte-18lr8ft");
    			add_location(td2, file$a, 8, 4, 234);
    			attr_dev(td3, "class", "border shade capitalize text-bold svelte-18lr8ft");
    			add_location(td3, file$a, 9, 4, 304);
    			attr_dev(td4, "class", "border shade text-bold svelte-18lr8ft");
    			add_location(td4, file$a, 10, 4, 376);
    			attr_dev(td5, "class", "border svelte-18lr8ft");
    			add_location(td5, file$a, 11, 4, 443);
    			attr_dev(td6, "class", "border svelte-18lr8ft");
    			add_location(td6, file$a, 12, 4, 473);
    			attr_dev(td7, "class", "border svelte-18lr8ft");
    			add_location(td7, file$a, 13, 4, 503);
    			add_location(tr, file$a, 5, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(td2, t5);
    			append_dev(tr, t6);
    			append_dev(tr, td3);
    			append_dev(td3, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td4);
    			append_dev(td4, t9);
    			append_dev(tr, t10);
    			append_dev(tr, td5);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(tr, t12);
    			append_dev(tr, td7);
    			insert_dev(target, t13, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t14, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*fragment*/ 1) && t0_value !== (t0_value = /*fragment*/ ctx[0].startTime + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*fragment*/ 1) && t2_value !== (t2_value = /*fragment*/ ctx[0].endTime + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*fragment*/ 1) && t4_value !== (t4_value = /*fragment*/ ctx[0].duration + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*fragment*/ 1) && t7_value !== (t7_value = /*fragment*/ ctx[0].type + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*fragment*/ 1) && t9_value !== (t9_value = /*fragment*/ ctx[0].difficulty + "")) set_data_dev(t9, t9_value);

    			if (/*fragment*/ ctx[0].type === "hybrid") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(t14.parentNode, t14);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*fragment*/ 1) {
    				each_value = /*fragment*/ ctx[0].modifiers;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (detaching) detach_dev(t13);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t14);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { fragment } = $$props;
    	const writable_props = ["fragment"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fragment> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fragment", $$slots, []);

    	$$self.$set = $$props => {
    		if ("fragment" in $$props) $$invalidate(0, fragment = $$props.fragment);
    	};

    	$$self.$capture_state = () => ({ Modifier: Modifier$1, fragment });

    	$$self.$inject_state = $$props => {
    		if ("fragment" in $$props) $$invalidate(0, fragment = $$props.fragment);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fragment];
    }

    class Fragment$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { fragment: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fragment",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fragment*/ ctx[0] === undefined && !("fragment" in props)) {
    			console.warn("<Fragment> was created without expected prop 'fragment'");
    		}
    	}

    	get fragment() {
    		throw new Error("<Fragment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fragment(value) {
    		throw new Error("<Fragment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Print\Content.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1$2, console: console_1$2 } = globals;
    const file$b = "src\\Print\\Content.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (21:4) {#each $routineState.fragments as fragment}
    function create_each_block$5(ctx) {
    	let fragment;
    	let current;

    	fragment = new Fragment$1({
    			props: { fragment: /*fragment*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(fragment.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fragment, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fragment_changes = {};
    			if (dirty & /*$routineState*/ 1) fragment_changes.fragment = /*fragment*/ ctx[2];
    			fragment.$set(fragment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fragment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fragment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fragment, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(21:4) {#each $routineState.fragments as fragment}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let current;
    	let each_value = /*$routineState*/ ctx[0].fragments;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Start";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "End";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Duration";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Description";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "MARK";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Expert";
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "w-1 border svelte-1e02orf");
    			add_location(th0, file$b, 12, 8, 309);
    			attr_dev(th1, "class", "w-1 border svelte-1e02orf");
    			add_location(th1, file$b, 13, 8, 352);
    			attr_dev(th2, "class", "w-2 border svelte-1e02orf");
    			add_location(th2, file$b, 14, 8, 393);
    			attr_dev(th3, "class", "w-5 border svelte-1e02orf");
    			add_location(th3, file$b, 15, 8, 439);
    			attr_dev(th4, "class", "w-1 border svelte-1e02orf");
    			add_location(th4, file$b, 16, 8, 488);
    			attr_dev(th5, "colspan", "3");
    			attr_dev(th5, "class", "w-3 border svelte-1e02orf");
    			add_location(th5, file$b, 17, 8, 530);
    			add_location(tr, file$b, 11, 4, 295);
    			add_location(thead, file$b, 10, 4, 282);
    			attr_dev(table, "class", "collapse w-17 m-default svelte-1e02orf");
    			add_location(table, file$b, 9, 0, 237);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(table, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$routineState*/ 1) {
    				each_value = /*$routineState*/ ctx[0].fragments;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(table, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $routineState;
    	validate_store(routineState, "routineState");
    	component_subscribe($$self, routineState, $$value => $$invalidate(0, $routineState = $$value));
    	let program = Object.assign({}, get_store_value(routineState));
    	console.log(program);
    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Content", $$slots, []);

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		routineState,
    		Fragment: Fragment$1,
    		program,
    		$routineState
    	});

    	$$self.$inject_state = $$props => {
    		if ("program" in $$props) program = $$props.program;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$routineState];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\Print\Print.svelte generated by Svelte v3.23.2 */
    const file$c = "src\\Print\\Print.svelte";

    function create_fragment$c(ctx) {
    	let div3;
    	let div0;
    	let header;
    	let t0;
    	let div1;
    	let total;
    	let t1;
    	let div2;
    	let program;
    	let current;
    	header = new Head({ $$inline: true });
    	total = new Total({ $$inline: true });
    	program = new Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(total.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(program.$$.fragment);
    			attr_dev(div0, "class", "flex-item svelte-1ut012a");
    			add_location(div0, file$c, 7, 4, 176);
    			attr_dev(div1, "class", "flex-item svelte-1ut012a");
    			add_location(div1, file$c, 10, 4, 237);
    			attr_dev(div2, "class", "flex-item svelte-1ut012a");
    			add_location(div2, file$c, 13, 4, 297);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$c, 6, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(header, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			mount_component(total, div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(program, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(total.$$.fragment, local);
    			transition_in(program.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(total.$$.fragment, local);
    			transition_out(program.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(header);
    			destroy_component(total);
    			destroy_component(program);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Print> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Print", $$slots, []);
    	$$self.$capture_state = () => ({ Header: Head, Total, Program: Content });
    	return [];
    }

    class Print extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Print",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.23.2 */
    const file$d = "src\\App.svelte";

    function create_fragment$d(ctx) {
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let t3;
    	let main;
    	let t4;
    	let div3;
    	let print;
    	let current;
    	main = new Main({ $$inline: true });
    	print = new Print({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "This is an alpha version of Difficulty calculator. It isn't optimized to mobile phones. This software tested primarily in Google Chrome browser. If you find any bugs (mistakes/errors), please, contact the developers by e-mail il5498@yandex.ru";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "v. 0.5.1";
    			t3 = space();
    			create_component(main.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			create_component(print.$$.fragment);
    			set_style(div0, "font-size", "medium");
    			set_style(div0, "text-align", "center");
    			set_style(div0, "border", "1px red solid");
    			attr_dev(div0, "class", "svelte-b33l3i");
    			add_location(div0, file$d, 4, 0, 102);
    			set_style(div1, "font-size", "xx-small");
    			attr_dev(div1, "class", "svelte-b33l3i");
    			add_location(div1, file$d, 6, 4, 447);
    			attr_dev(div2, "class", "app svelte-b33l3i");
    			add_location(div2, file$d, 5, 0, 425);
    			attr_dev(div3, "class", "print svelte-b33l3i");
    			add_location(div3, file$d, 9, 0, 515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div2, t3);
    			mount_component(main, div2, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(print, div3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			transition_in(print.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			transition_out(print.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(main);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			destroy_component(print);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Main, Print });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
