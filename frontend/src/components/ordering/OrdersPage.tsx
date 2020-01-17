import React from "react";
import Page from "../shared/Page";
import { OrderDetails } from "./model";
import { useQuery, gql } from "@apollo/client";
import QueryResultWrapper from "../shared/QueryResultWrapper";
import { Table, Label } from "semantic-ui-react";
import { formatDate, formatCurrency } from "/lib/format";
import { useHistory } from "react-router-dom";
import "./OrdersPage.less";

export const MY_ORDERS_QUERY = gql`
  query {
    orders {
      id
      orderDate
      orderAmount
      state
    }
  }
`;

function OrdersPage() {
  const result = useQuery<OrderDetails>(MY_ORDERS_QUERY);

  return (
    <Page title="My Orders" className="OrdersPage">
      <QueryResultWrapper
        result={result}
        render={data => <OrderList orders={data.orders} />}
      />
    </Page>
  );
}

function OrderList({ orders }: { orders: OrderDetails[] }) {
  const history = useHistory();

  return (
    <Table selectable className="OrdersTable">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>State</Table.HeaderCell>
          <Table.HeaderCell textAlign="right">Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {orders.map(order => (
          <Table.Row
            key={order.id}
            onClick={() => history.push(`/orders/${order.id}`)}
          >
            <Table.Cell>{order.id}</Table.Cell>
            <Table.Cell>{formatDate(order.orderDate)}</Table.Cell>
            <Table.Cell>
              <Label content={order.state.toUpperCase()} />
            </Table.Cell>
            <Table.Cell textAlign="right">
              {formatCurrency(order.orderAmount)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export default OrdersPage;
