defmodule Caffe.Orders.Aliases do
  defmacro __using__(_) do
    quote do
      alias Caffe.Orders.Aggregates.Tab
      alias Caffe.Orders.Commands.OpenTab
      alias Caffe.Orders.Events.TabOpened
    end
  end
end
