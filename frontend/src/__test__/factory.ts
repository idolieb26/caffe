import { MockedResponse } from "@apollo/client/testing";
import { DocumentNode } from "@apollo/client";
import { User } from "/components/AuthProvider";
import { Order, OrderItem } from "/components/ordering/model";
import { MenuItem } from "/components/configuration/model";

function sequenceGen() {
  let n = 1;
  return {
    next() {
      return n++;
    }
  };
}

const sequence = sequenceGen();

interface MockQueryOpts {
  variables?: Record<string, any>;
}

export function mockQuery(
  query: DocumentNode,
  { variables = {} }: MockQueryOpts = {}
) {
  const baseResponse = {
    request: {
      query: query,
      variables: variables
    }
  };

  return {
    returnsData(data: any): MockedResponse {
      return {
        ...baseResponse,
        result: {
          data: data
        }
      };
    },

    returnsError(error: any): MockedResponse {
      return {
        ...baseResponse,
        result: {
          errors: [error]
        }
      };
    },

    returnsNetworkError(error: any): MockedResponse {
      return {
        ...baseResponse,
        error: error
      };
    }
  };
}

export function user(fields?: Partial<User>): User {
  return {
    id: sequence.next().toString(),
    name: "User name",
    email: "user@acme.com",
    permissions: [],
    ...fields
  };
}

export function menuItem(fields?: Partial<MenuItem>): MenuItem {
  return {
    id: sequence.next().toString(),
    name: "Burger",
    price: 10.5,
    isDrink: false,
    description: "",
    category: { name: "Food" },
    ...fields
  };
}

export function order(fields?: Partial<Order>): Order {
  return {
    items: [],
    notes: "",
    ...fields
  };
}

export function item(fields?: Partial<OrderItem>): OrderItem {
  const mi = menuItem();
  return {
    menuItemId: mi.id,
    menuItemName: mi.name,
    quantity: 1,
    price: 10.5,
    ...fields
  };
}
