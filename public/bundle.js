
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.17.1' }, detail)));
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
    }

    /* src/App.svelte generated by Svelte v3.17.1 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t1;
    	let t2;
    	let t3;
    	let h1;
    	let t4;
    	let t5;
    	let h2;
    	let t7;
    	let p1;
    	let strong0;
    	let t9;
    	let br0;
    	let t10;
    	let br1;
    	let t11;
    	let br2;
    	let t12;
    	let br3;
    	let t13;
    	let br4;
    	let t14;
    	let br5;
    	let t15;
    	let br6;
    	let t16;
    	let br7;
    	let t17;
    	let br8;
    	let t18;
    	let br9;
    	let t19;
    	let br10;
    	let t20;
    	let br11;
    	let t21;
    	let br12;
    	let t22;
    	let br13;
    	let t23;
    	let strong1;
    	let br14;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text("YOU ARE WORSHIPER ");
    			t2 = text(/*connectionId*/ ctx[1]);
    			t3 = space();
    			h1 = element("h1");
    			t4 = text(/*message*/ ctx[0]);
    			t5 = space();
    			h2 = element("h2");
    			h2.textContent = "The Lord's Prayer";
    			t7 = space();
    			p1 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Our Father";
    			t9 = text(", which art in Snake Eyes,");
    			br0 = element("br");
    			t10 = text(" \n  Nicolas be thy name;");
    			br1 = element("br");
    			t11 = text("  \n  thy  Face/Off come;");
    			br2 = element("br");
    			t12 = text("  \n  thy Con-Air be done,");
    			br3 = element("br");
    			t13 = text("  \n  in earth as it is in Deadfall.");
    			br4 = element("br");
    			t14 = text("  \n  Give us this day our daily Ghost Rider.");
    			br5 = element("br");
    			t15 = text("  \n  And forgive him for Trespass,");
    			br6 = element("br");
    			t16 = text("  \n  as we forgave him for Windtalkers.");
    			br7 = element("br");
    			t17 = text("  \n  And lead us not into Adaptation.;");
    			br8 = element("br");
    			t18 = text("  \n  but deliver us from The Rock.");
    			br9 = element("br");
    			t19 = space();
    			br10 = element("br");
    			t20 = text(" \t\n  For thine is the Wicker Man,");
    			br11 = element("br");
    			t21 = text("  \n  the National Treasure,");
    			br12 = element("br");
    			t22 = text("  \n  for ever and ever.");
    			br13 = element("br");
    			t23 = space();
    			strong1 = element("strong");
    			strong1.textContent = "Amen";
    			br14 = element("br");
    			if (img.src !== (img_src_value = "cagepng.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "One True God");
    			add_location(img, file, 30, 0, 578);
    			add_location(p0, file, 31, 0, 622);
    			add_location(h1, file, 32, 0, 662);
    			add_location(h2, file, 33, 0, 681);
    			add_location(strong0, file, 34, 3, 711);
    			add_location(br0, file, 34, 56, 764);
    			add_location(br1, file, 35, 22, 792);
    			add_location(br2, file, 36, 21, 820);
    			add_location(br3, file, 37, 22, 849);
    			add_location(br4, file, 38, 32, 888);
    			add_location(br5, file, 39, 41, 936);
    			add_location(br6, file, 40, 31, 974);
    			add_location(br7, file, 41, 36, 1017);
    			add_location(br8, file, 42, 35, 1059);
    			add_location(br9, file, 43, 31, 1097);
    			add_location(br10, file, 44, 2, 1105);
    			add_location(br11, file, 45, 30, 1142);
    			add_location(br12, file, 46, 24, 1173);
    			add_location(br13, file, 47, 20, 1200);
    			add_location(strong1, file, 48, 2, 1209);
    			add_location(br14, file, 48, 23, 1230);
    			add_location(p1, file, 34, 0, 708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, strong0);
    			append_dev(p1, t9);
    			append_dev(p1, br0);
    			append_dev(p1, t10);
    			append_dev(p1, br1);
    			append_dev(p1, t11);
    			append_dev(p1, br2);
    			append_dev(p1, t12);
    			append_dev(p1, br3);
    			append_dev(p1, t13);
    			append_dev(p1, br4);
    			append_dev(p1, t14);
    			append_dev(p1, br5);
    			append_dev(p1, t15);
    			append_dev(p1, br6);
    			append_dev(p1, t16);
    			append_dev(p1, br7);
    			append_dev(p1, t17);
    			append_dev(p1, br8);
    			append_dev(p1, t18);
    			append_dev(p1, br9);
    			append_dev(p1, t19);
    			append_dev(p1, br10);
    			append_dev(p1, t20);
    			append_dev(p1, br11);
    			append_dev(p1, t21);
    			append_dev(p1, br12);
    			append_dev(p1, t22);
    			append_dev(p1, br13);
    			append_dev(p1, t23);
    			append_dev(p1, strong1);
    			append_dev(p1, br14);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*connectionId*/ 2) set_data_dev(t2, /*connectionId*/ ctx[1]);
    			if (dirty & /*message*/ 1) set_data_dev(t4, /*message*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p1);
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
    	let { message } = $$props;
    	let wsUrl;
    	let connectionId;

    	onMount(async () => {
    		let data = await (await fetch("/api")).json();
    		$$invalidate(0, message = data.msg);
    		wsUrl = data.wsUrl;
    		console.log("MESSAGE: ", message);
    		const ws = new WebSocket(wsUrl);

    		ws.onopen = () => {
    			let payload = { action: "connected" };
    			ws.send(JSON.stringify(payload));
    		};

    		ws.onmessage = e => {
    			let msg = JSON.parse(e.data);
    			$$invalidate(1, connectionId = msg.id);
    		};
    	});

    	const writable_props = ["message"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    	};

    	$$self.$capture_state = () => {
    		return { message, wsUrl, connectionId };
    	};

    	$$self.$inject_state = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("wsUrl" in $$props) wsUrl = $$props.wsUrl;
    		if ("connectionId" in $$props) $$invalidate(1, connectionId = $$props.connectionId);
    	};

    	return [message, connectionId];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { message: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*message*/ ctx[0] === undefined && !("message" in props)) {
    			console_1.warn("<App> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let message = '...loading';

    const app = new App({
      target: document.body,
      props: {
        message
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
